import { useSyncExternalStore } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Collections, StoredRecord } from './retention'
export const archiveIndexKey = 'plans-tracker.memory-archive-index'
let archive: Collections = {}
let version = 0
const listeners = new Set<() => void>()
export function useArchiveVersion() {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
        () => version,
        () => version,
    )
}
export function unloadedArchiveCount() {
    return Object.entries(index).reduce((count, [key, ids]) => {
        const loaded = new Set((archive[key] ?? []).map((item) => item.id))
        return count + ids.filter((id) => !loaded.has(id)).length
    }, 0)
}
let index: Record<string, string[]> = {}
export function setArchive(value: Collections) {
    archive = value
    version++
    listeners.forEach((listener) => listener())
}
export function setArchiveIndex(value: Record<string, string[]>) {
    index = value
}
export function getArchiveIndex() {
    return index
}
export function mergeArchive<T extends { id: string }>(
    key: string,
    local: T[],
): T[] {
    const items = new Map<string, T>()
    for (const item of archive[key] ?? [])
        items.set(item.id, item as unknown as T)
    for (const item of local) items.set(item.id, item)
    return [...items.values()]
}
/** Stage this index together with a collection write; loaded archive becomes local. */
export function materializedIndex(key: string) {
    const loaded = new Set((archive[key] ?? []).map((item) => item.id))
    return {
        ...index,
        [key]: (index[key] ?? []).filter((id) => !loaded.has(id)),
    }
}
export function forgetArchive(
    key: string,
    nextIndex: Record<string, string[]>,
) {
    delete archive[key]
    index = nextIndex
}
export async function loadArchiveIndex() {
    index = JSON.parse((await AsyncStorage.getItem(archiveIndexKey)) ?? '{}')
}
export function archiveCollections(data: Collections) {
    return Object.fromEntries(
        Object.entries(data).map(([key, records]) => [
            key,
            mergeArchive<StoredRecord>(key, records),
        ]),
    )
}
