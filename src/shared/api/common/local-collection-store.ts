import {
    mergeArchive,
    forgetArchive,
    materializedIndex,
    archiveIndexKey,
} from '@/shared/lib/memory/archive'
import { withStorageTransaction, commitStorage } from './storage-transaction'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logDebug, logError } from '@/shared/lib/diagnostics/app-logger'

type WithId = { id: string }

const PRIVATE_FIELD =
    /title|description|label|text|content|html|note|email|name|location|url|address|phone|token|password/i

function summarizeValue(value: unknown, field: string, depth = 0): unknown {
    if (PRIVATE_FIELD.test(field)) {
        return typeof value === 'string'
            ? `[redacted; ${value.length} chars]`
            : '[redacted]'
    }
    if (
        value == null ||
        typeof value === 'boolean' ||
        typeof value === 'number'
    )
        return value
    if (typeof value === 'string') return value.slice(0, 160)
    if (Array.isArray(value))
        return value
            .slice(0, 20)
            .map((item) => summarizeValue(item, field, depth + 1))
    if (typeof value === 'object') {
        if (depth > 3) return '[nested object omitted]'
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .slice(0, 30)
                .map(([key, item]) => [
                    key,
                    summarizeValue(item, key, depth + 1),
                ]),
        )
    }
    return String(value).slice(0, 160)
}

function summarizeFields(record: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(record).map(([key, value]) => [
            key,
            summarizeValue(value, key),
        ]),
    )
}

/**
 * AsyncStorage collection with a shared maintenance/write queue. Confirmed cold
 * records are read from the in-memory iCloud archive and materialized on edit.
 */
export function createLocalCollectionStore<T extends WithId>(
    storageKey: string,
) {
    const listeners = new Set<() => void>()

    async function readAll(): Promise<T[]> {
        const raw = await AsyncStorage.getItem(storageKey)
        if (!raw) return mergeArchive<T>(storageKey, [])
        try {
            return mergeArchive<T>(storageKey, JSON.parse(raw) as T[])
        } catch (error) {
            void logError('storage', 'invalid_collection_json', error, {
                storageKey,
                rawLength: raw.length,
            })
            return []
        }
    }

    async function writeAll(items: T[]): Promise<void> {
        const index = materializedIndex(storageKey)
        await commitStorage([
            [storageKey, JSON.stringify(items)],
            [archiveIndexKey, JSON.stringify(index)],
        ])
        forgetArchive(storageKey, index)
    }

    function mutate<R>(
        task: (items: T[]) => { items: T[]; result: R },
    ): Promise<R> {
        const run = withStorageTransaction(async () => {
            const items = await readAll()
            const { items: nextItems, result } = task(items)
            await writeAll(nextItems)
            if (nextItems !== items) {
                for (const listener of listeners) listener()
            }
            return result
        })
        // Keep the queue alive even if this mutation rejects, so later ones
        // still run against a consistent (if stale) state instead of jamming.
        return run
    }

    async function tracked<R>(
        operation: string,
        details: Record<string, unknown>,
        execute: () => Promise<R>,
        summarize?: (result: R) => Record<string, unknown>,
    ): Promise<R> {
        const startedAt = Date.now()
        try {
            const result = await execute()
            void logDebug('storage', operation, {
                storageKey,
                ...details,
                ...summarize?.(result),
                durationMs: Date.now() - startedAt,
            })
            return result
        } catch (error) {
            void logError('storage', `${operation}_failed`, error, {
                storageKey,
                ...details,
                durationMs: Date.now() - startedAt,
            })
            throw error
        }
    }

    return {
        /** Apply an ordered collection change in one storage transaction. */
        transform(update: (items: T[]) => T[]): Promise<T[]> {
            return mutate((items) => {
                const next = update(items)
                return { items: next, result: next }
            })
        },
        subscribe(listener: () => void): () => void {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },

        list(): Promise<T[]> {
            return tracked('list', {}, readAll, (items) => ({
                resultCount: items.length,
            }))
        },

        get(id: string): Promise<T | null> {
            return tracked(
                'get',
                { id },
                async () => {
                    const items = await readAll()
                    return items.find((item) => item.id === id) ?? null
                },
                (item) => ({ found: item !== null }),
            )
        },

        insert(item: T): Promise<T> {
            return tracked(
                'insert',
                { id: item.id, values: summarizeFields(item) },
                () =>
                    mutate((items) => ({
                        items: [...items, item],
                        result: item,
                    })),
            )
        },

        update(id: string, patch: Partial<T>): Promise<T> {
            return tracked(
                'update',
                {
                    id,
                    values: summarizeFields(patch as Record<string, unknown>),
                },
                () =>
                    mutate((items) => {
                        const index = items.findIndex((item) => item.id === id)
                        if (index === -1)
                            throw new Error(
                                `Record "${id}" not found in "${storageKey}"`,
                            )
                        const updated = { ...items[index], ...patch }
                        const nextItems = [...items]
                        nextItems[index] = updated
                        return { items: nextItems, result: updated }
                    }),
            )
        },

        remove(id: string): Promise<void> {
            return tracked('remove', { id }, () =>
                mutate((items) => ({
                    items: items.filter((item) => item.id !== id),
                    result: undefined,
                })),
            )
        },

        /** Inserts when no item matches `match`, otherwise patches the first match via `onExisting`. */
        upsert(
            match: (item: T) => boolean,
            create: () => T,
            onExisting: (item: T) => T,
        ): Promise<T> {
            return tracked('upsert', {}, () =>
                mutate((items) => {
                    const index = items.findIndex(match)
                    if (index === -1) {
                        const created = create()
                        return { items: [...items, created], result: created }
                    }
                    const updated = onExisting(items[index])
                    const nextItems = [...items]
                    nextItems[index] = updated
                    return { items: nextItems, result: updated }
                }),
            )
        },

        /** Writes `seed` only the first time the store is read empty — used to populate built-in defaults (e.g. the "todo"/"done" statuses). */
        seedIfEmpty(seed: T[]): Promise<void> {
            return tracked('seed_if_empty', { seedCount: seed.length }, () =>
                mutate((items) =>
                    items.length > 0
                        ? { items, result: undefined }
                        : { items: seed, result: undefined },
                ),
            )
        },
    }
}
