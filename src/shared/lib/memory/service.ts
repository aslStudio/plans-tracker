import { t } from '@/shared/lib/i18n'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    commitStorage,
    withStorageTransaction,
} from '@/shared/api/common/storage-transaction'
import { todayDateString } from '@/shared/lib/date'
import { clearAppLogs, logError } from '@/shared/lib/diagnostics/app-logger'
import { currentUser } from '@/shared/lib/auth/session'
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
    assertSyncOwner,
    baseKey,
    mergeSnapshots,
    ownerKey,
    readRemoteSnapshot,
    readSavedBase,
    syncedValueKeys,
    writeRemoteSnapshot,
    type Snapshot,
} from './backend-snapshot'
import { setSyncOffline } from './sync-status'
import {
    cleanupPlan,
    keys,
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
    return currentUser()
        ? { available: true, message: t('Синхронизация с сервером включена') }
        : { available: false, message: t('Войдите, чтобы синхронизировать данные') }
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
/** One-time recovery of records offloaded by older iCloud builds. */
export function hydrateArchive() {
    return withStorageTransaction(async () => {
        const settings = await getMemorySettings()
        if (!Object.values(getArchiveIndex()).some((ids) => ids.length))
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
        const data = archiveCollections(await readCollections())
        await commitStorage([
            ...Object.entries(data).map(([key, records]): [string, string] => [
                key,
                JSON.stringify(records),
            ]),
            [archiveIndexKey, '{}'],
        ])
        setArchiveIndex({})
        setArchive({})
    })
}
async function localSnapshot(): Promise<Snapshot> {
    const pairs = await AsyncStorage.multiGet([...syncedValueKeys])
    return {
        version: 2,
        data: await readCollections(),
        history: getMemoryHistory(),
        values: Object.fromEntries(
            pairs.map(([key, raw]) => [key, raw ? JSON.parse(raw) : null]),
        ),
    }
}

function isEmpty(snapshot: Snapshot) {
    return Object.values(snapshot.data).every((records) =>
        records.every((record) =>
            String(record.id).startsWith('status-') ||
            String(record.id).startsWith('priority-'),
        ),
    )
}

let activeSync: Promise<void> | null = null
export function syncMemory(_force = false): Promise<void> {
    if (!currentUser()) return Promise.resolve()
    if (activeSync) return activeSync
    activeSync = performSync().finally(() => {
        activeSync = null
    })
    return activeSync
}

async function performSync() {
    let userId: string | null
    try {
        userId = await assertSyncOwner()
    } catch (error) {
        throw new MemoryUserError(error instanceof Error ? error.message : t('Не удалось синхронизировать данные'))
    }
    if (!userId) return
    try {
        await hydrateArchive()
        for (let attempt = 0; attempt < 4; attempt++) {
            const local = await withStorageTransaction(localSnapshot)
            const base = await readSavedBase()
            const remote = await readRemoteSnapshot()
            const matchedBase = base?.userId === userId ? base.payload : null
            const merged = !matchedBase && remote.payload && isEmpty(local)
                ? remote.payload
                : mergeSnapshots(matchedBase, local, remote.payload)
            const dataChanged = JSON.stringify(merged) !== JSON.stringify(local)
            let revision = remote.revision
            if (JSON.stringify(merged) !== JSON.stringify(remote.payload)) {
                const written = await writeRemoteSnapshot(remote.revision, merged)
                if (written === null) continue
                revision = written
            }
            const applied = await withStorageTransaction(async () => {
                if (currentUser()?.id !== userId) return false
                const latest = await localSnapshot()
                const unchanged = JSON.stringify(latest) === JSON.stringify(local)
                const settings = await getMemorySettings()
                await commitStorage([
                    [baseKey, JSON.stringify({ userId, revision, payload: merged })],
                    [ownerKey, userId],
                    ...(unchanged
                        ? [
                              ...Object.entries(merged.data).map(
                                  ([key, records]): [string, string] => [key, JSON.stringify(records)],
                              ),
                              ...Object.entries(merged.values).map(
                                  ([key, value]): [string, string] => [key, JSON.stringify(value)],
                              ),
                              [historyKey, JSON.stringify(merged.history)] as [string, string],
                          ]
                        : []),
                    [memoryKey, JSON.stringify({
                        ...settings,
                        enabled: true,
                        lastSync: new Date().toISOString(),
                        cloudBytes: utf8Bytes(JSON.stringify(merged)),
                        pendingDeletion: false,
                    })],
                ])
                if (unchanged) {
                    setMemoryHistory(merged.history)
                    if (dataChanged) setArchive({})
                }
                return unchanged
            })
            if (applied) {
                setSyncOffline(false)
                return
            }
        }
        throw new Error('sync changed too frequently')
    } catch (error) {
        if (currentUser()?.id === userId) setSyncOffline(true)
        throw error
    }
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
                        'Для очистки старого архива подключитесь к iCloud. Данные не удалены.',
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
                    pendingDeletion: Boolean(currentUser()),
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
        onProgress(t('Синхронизируем с сервером'))
        await syncMemory(true)
    } catch (error) {
        cloudPending = true
        void logError('memory', 'server_cleanup_pending', error)
    }
    cloudPending =
        cloudPending || Boolean((await getMemorySettings()).pendingDeletion)
    return { removed: result, cloudPending }
}
