import { withStorageTransaction } from './storage-transaction'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logDebug, logError } from '@/shared/lib/diagnostics/app-logger'

/**
 * AsyncStorage-backed store for a single JSON object keyed by `storageKey`
 * (as opposed to `createLocalCollectionStore`'s array-of-records shape) —
 * for app-wide settings, not a list of entities.
 *
 * Reads merge over `defaultValue` rather than returning the raw parsed
 * object, so a settings shape that grows a new field later still gets a
 * sane default for it from an older persisted blob instead of `undefined`.
 */
export function createLocalValueStore<T extends Record<string, unknown>>(
    storageKey: string,
    defaultValue: T,
) {
    async function read(): Promise<T> {
        const raw = await AsyncStorage.getItem(storageKey)
        if (!raw) return defaultValue
        try {
            return { ...defaultValue, ...(JSON.parse(raw) as Partial<T>) }
        } catch (error) {
            void logError('storage', 'invalid_value_json', error, {
                storageKey,
                rawLength: raw.length,
            })
            return defaultValue
        }
    }

    function mutate(task: (current: T) => T): Promise<T> {
        const run = withStorageTransaction(async () => {
            const current = await read()
            const next = task(current)
            await AsyncStorage.setItem(storageKey, JSON.stringify(next))
            return next
        })
        return run
    }

    return {
        get(): Promise<T> {
            const startedAt = Date.now()
            return read()
                .then((value) => {
                    void logDebug('storage', 'read_value', {
                        storageKey,
                        fields: Object.keys(value),
                        durationMs: Date.now() - startedAt,
                    })
                    return value
                })
                .catch((error) => {
                    void logError('storage', 'read_value_failed', error, {
                        storageKey,
                        durationMs: Date.now() - startedAt,
                    })
                    throw error
                })
        },
        update(patch: Partial<T>): Promise<T> {
            const startedAt = Date.now()
            return mutate((current) => ({ ...current, ...patch }))
                .then((value) => {
                    void logDebug('storage', 'update_value', {
                        storageKey,
                        fields: Object.keys(patch),
                        durationMs: Date.now() - startedAt,
                    })
                    return value
                })
                .catch((error) => {
                    void logError('storage', 'update_value_failed', error, {
                        storageKey,
                        fields: Object.keys(patch),
                        durationMs: Date.now() - startedAt,
                    })
                    throw error
                })
        },
    }
}
