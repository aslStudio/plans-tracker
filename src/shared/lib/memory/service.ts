import { t } from '@/shared/lib/i18n'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    commitStorage,
    withStorageTransaction,
} from '@/shared/api/common/storage-transaction'
import { addDays, todayDateString, toLocalDateString } from '@/shared/lib/date'
import { clearAppLogs, logError } from '@/shared/lib/diagnostics/app-logger'
import {
    emptyHistory,
    getMemoryHistory,
    setMemoryHistory,
    type MemoryHistory,
} from './history'
import {
    archiveCollections,
    archiveIndexKey,
    getArchiveIndex,
    loadArchiveIndex,
    setArchive,
    setArchiveIndex,
} from './archive'
import { cloud } from './cloud'
import {
    cleanupPlan,
    inactiveIds,
    keys,
    monthBefore,
    utf8Bytes,
    type Collections,
} from './retention'

/** Deliberately thrown, already user-facing-worded — the UI shows these messages as-is. Anything else (a raw native/CloudKit error) gets a generic fallback instead. */
export class MemoryUserError extends Error {}

export const memoryKey = 'plans-tracker.memory-settings'
export const historyKey = 'plans-tracker.memory-history'
export type SyncInterval = 'day' | 'week' | 'month'
export type MemorySettings = {
    interval: SyncInterval
    enabled: boolean
    lastSync?: string
    cloudBytes?: number
    tag?: string
    account?: string
    pendingDeletion?: boolean
}
const defaults: MemorySettings = { interval: 'day', enabled: false }
export async function getMemorySettings(): Promise<MemorySettings> {
    return {
        ...defaults,
        ...JSON.parse((await AsyncStorage.getItem(memoryKey)) ?? '{}'),
    }
}
export function updateMemorySettings(
    patch: Partial<Pick<MemorySettings, 'interval' | 'enabled'>>,
) {
    return withStorageTransaction(async () => {
        const settings = { ...(await getMemorySettings()), ...patch }
        await AsyncStorage.setItem(memoryKey, JSON.stringify(settings))
        return settings
    })
}
async function readCollections(): Promise<Collections> {
    const pairs = await AsyncStorage.multiGet(Object.values(keys))
    return Object.fromEntries(
        pairs.map(([key, raw]) => {
            const value: unknown = raw ? JSON.parse(raw) : []
            if (!Array.isArray(value))
                throw new MemoryUserError(
                    t('Не удалось прочитать данные. Очистка отменена.'),
                )
            return [key, value]
        }),
    )
}
export async function initializeMemory() {
    await withStorageTransaction(async () => {
        setMemoryHistory(
            JSON.parse(
                (await AsyncStorage.getItem(historyKey)) ??
                    JSON.stringify(emptyHistory),
            ),
        )
        await loadArchiveIndex()
    })
}
export async function memoryUsage() {
    const allKeys = (await AsyncStorage.getAllKeys()).filter(
        (key) =>
            key.startsWith('plans-tracker.') &&
            key !== 'plans-tracker.memory-transaction',
    )
    const entries = await AsyncStorage.multiGet(allKeys)
    const groups = [
        { label: t('Задачи'), bytes: 0, color: 'accent-blue' },
        { label: t('Привычки'), bytes: 0, color: 'accent-orange' },
        { label: t('Календарь'), bytes: 0, color: 'accent-indigo' },
        { label: t('Настройки и серия'), bytes: 0, color: 'accent-green' },
        { label: t('Логи'), bytes: 0, color: 'gray-gray' },
    ]
    for (const [key, value] of entries) {
        const i = key.includes('diagnostics')
            ? 4
            : key.includes('task')
              ? 0
              : key.includes('habit')
                ? 1
                : key.includes('calendar')
                  ? 2
                  : 3
        groups[i].bytes += utf8Bytes(key) + utf8Bytes(value ?? '')
    }
    return {
        groups,
        localBytes: groups.reduce((sum, group) => sum + group.bytes, 0),
        settings: await getMemorySettings(),
    }
}
function validatePayload(payload: string): {
    version: 1
    data: Collections
    history: MemoryHistory
} {
    const value = JSON.parse(payload)
    if (
        value?.version !== 1 ||
        !value.data ||
        !value.history ||
        Object.values(keys).some((key) => !Array.isArray(value.data[key]))
    ) {
        throw new MemoryUserError(
            t(
                'Версия архива iCloud не поддерживается. Локальные данные сохранены.',
            ),
        )
    }
    return value
}
export async function cloudStatus() {
    if (!cloud)
        return {
            available: false,
            message: t(
                'iCloud будет доступен в iOS-сборке с подключённым облаком.',
            ),
        }
    try {
        await cloud.account()
        return { available: true, message: t('iCloud доступен') }
    } catch {
        // A bare `cloud.account()` only ever fails with a raw native/CloudKit
        // error (e.g. a CKErrorDomain code) — never anything worth showing as-is.
        return { available: false, message: t('iCloud сейчас недоступен') }
    }
}
async function readCloud(settings: MemorySettings) {
    if (!cloud)
        throw new MemoryUserError(
            t(
                'iCloud не подключён в этой сборке. Все данные остаются на устройстве.',
            ),
        )
    const account = await cloud.account()
    if (settings.account && settings.account !== account)
        throw new MemoryUserError(
            t(
                'Аккаунт iCloud изменился. Архив прежнего аккаунта не будет перенесён в новый.',
            ),
        )
    const remote = await cloud.read()
    if (settings.tag && remote?.tag !== settings.tag)
        throw new MemoryUserError(
            t(
                'Архив iCloud изменён на другом устройстве. Автоматическая запись остановлена, локальные данные сохранены.',
            ),
        )
    return {
        account,
        remote,
        saved: remote ? validatePayload(remote.payload) : null,
    }
}
/** Download only the offloaded records into RAM; never persist a second archive on disk. */
export function hydrateArchive() {
    return withStorageTransaction(async () => {
        const settings = await getMemorySettings()
        if (
            !settings.enabled ||
            !Object.values(getArchiveIndex()).some((ids) => ids.length)
        )
            return
        const { saved } = await readCloud(settings)
        if (!saved)
            throw new MemoryUserError(
                t('Архив iCloud не найден. Локальные данные сохранены.'),
            )
        setArchive(
            Object.fromEntries(
                Object.entries(getArchiveIndex()).map(([key, ids]) => [
                    key,
                    (saved.data[key] ?? []).filter((item) =>
                        ids.includes(item.id),
                    ),
                ]),
            ),
        )
    })
}
export function syncMemory(force = false) {
    return withStorageTransaction(async () => {
        const settings = await getMemorySettings()
        if (!settings.enabled) return
        const today = todayDateString()
        const dueBefore =
            settings.interval === 'day'
                ? addDays(today, -1)
                : settings.interval === 'week'
                  ? addDays(today, -7)
                  : monthBefore(today)
        if (
            !force &&
            settings.lastSync &&
            toLocalDateString(new Date(settings.lastSync)) > dueBefore &&
            !settings.pendingDeletion
        )
            return
        const { account, remote, saved } = await readCloud(settings)
        let data = await readCollections()
        if (saved && !settings.tag) {
            if (
                Object.values(data).some((records) =>
                    records.some(
                        (record) =>
                            !String(record.id).startsWith('status-') &&
                            !String(record.id).startsWith('priority-'),
                    ),
                )
            ) {
                throw new MemoryUserError(
                    t(
                        'В iCloud уже есть архив. Подключение остановлено, чтобы не заменить данные на устройстве или в облаке.',
                    ),
                )
            }
            data = saved.data
        } else if (saved) {
            for (const [key, ids] of Object.entries(getArchiveIndex())) {
                const localIds = new Set(
                    (data[key] ?? []).map((item) => item.id),
                )
                data[key] = [
                    ...(data[key] ?? []),
                    ...(saved.data[key] ?? []).filter(
                        (item) =>
                            ids.includes(item.id) && !localIds.has(item.id),
                    ),
                ]
            }
        }
        const history =
            saved && !settings.tag ? saved.history : getMemoryHistory()
        const payload = JSON.stringify({ version: 1, data, history })
        const tag = await cloud!.write(payload, remote?.tag ?? null)
        const offloaded = inactiveIds(
            data,
            settings.interval === 'day'
                ? addDays(today, -1)
                : settings.interval === 'week'
                  ? addDays(today, -7)
                  : monthBefore(today),
        )
        const index = Object.fromEntries(
            Object.entries(offloaded).map(([key, ids]) => [key, [...ids]]),
        )
        const local = Object.fromEntries(
            Object.entries(data).map(([key, records]) => [
                key,
                records.filter((item) => !offloaded[key]?.has(item.id)),
            ]),
        )
        const nextSettings = {
            ...settings,
            account,
            tag,
            lastSync: new Date().toISOString(),
            cloudBytes: utf8Bytes(payload),
            pendingDeletion: false,
        }
        // Cloud confirmed the full payload before any local records are evicted.
        await commitStorage([
            ...Object.entries(local).map(([key, value]): [string, string] => [
                key,
                JSON.stringify(value),
            ]),
            [archiveIndexKey, JSON.stringify(index)],
            [historyKey, JSON.stringify(history)],
            [memoryKey, JSON.stringify(nextSettings)],
        ])
        setMemoryHistory(history)
        setArchiveIndex(index)
        setArchive(
            Object.fromEntries(
                Object.entries(data).map(([key, records]) => [
                    key,
                    records.filter((item) => offloaded[key]?.has(item.id)),
                ]),
            ),
        )
    })
}
export async function cleanMemory(
    mode: 'all' | 'old',
    onProgress: (message: string) => void,
) {
    const result = await withStorageTransaction(async () => {
        onProgress(t('Сохраняем вашу серию'))
        const settings = await getMemorySettings()
        let data = archiveCollections(await readCollections())
        // A destructive operation must include the cold archive, not pretend it is absent.
        if (Object.values(getArchiveIndex()).some((ids) => ids.length)) {
            const { saved } = await readCloud(settings)
            if (!saved)
                throw new MemoryUserError(
                    t(
                        'Для очистки архива подключитесь к iCloud. Данные не удалены.',
                    ),
                )
            for (const [key, ids] of Object.entries(getArchiveIndex())) {
                const present = new Set(data[key].map((item) => item.id))
                data[key] = [
                    ...data[key],
                    ...saved.data[key].filter(
                        (item) =>
                            ids.includes(item.id) && !present.has(item.id),
                    ),
                ]
            }
        }
        const plan = cleanupPlan(
            data,
            getMemoryHistory(),
            mode,
            todayDateString(),
        )
        onProgress(t('Удаляем выбранные данные'))
        await commitStorage([
            ...Object.entries(plan.next).map(
                ([key, value]): [string, string] => [
                    key,
                    JSON.stringify(value),
                ],
            ),
            [historyKey, JSON.stringify(plan.history)],
            [archiveIndexKey, '{}'],
            [
                memoryKey,
                JSON.stringify({
                    ...settings,
                    pendingDeletion: Boolean(settings.tag),
                }),
            ],
        ])
        setMemoryHistory(plan.history)
        setArchive({})
        setArchiveIndex({})
        return plan.removed
    })
    if (mode === 'all') await clearAppLogs()
    let cloudPending = false
    try {
        onProgress(t('Обновляем архив iCloud'))
        await syncMemory(true)
    } catch (error) {
        cloudPending = true
        void logError('memory', 'cloud_cleanup_pending', error)
    }
    cloudPending =
        cloudPending || Boolean((await getMemorySettings()).pendingDeletion)
    return { removed: result, cloudPending }
}
