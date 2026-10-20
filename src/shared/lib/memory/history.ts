import { useSyncExternalStore } from 'react'

export type StreakAnchor = { through: string; count: number }
export type MemoryHistory = {
    clearedAt?: string
    firstDate?: string
    global?: StreakAnchor
    habits: Record<string, StreakAnchor>
    deletedThrough?: string
    deletedIds: Record<string, string[]>
}
export const emptyHistory: MemoryHistory = { habits: {}, deletedIds: {} }
let history: MemoryHistory = emptyHistory
const listeners = new Set<() => void>()
export function getMemoryHistory() {
    return history
}
export function setMemoryHistory(value: MemoryHistory) {
    history = value
    listeners.forEach((listener) => listener())
}
export function useMemoryHistory() {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
        getMemoryHistory,
        getMemoryHistory,
    )
}
export function isDeletedDate(date: string) {
    return Boolean(history.deletedThrough && date <= history.deletedThrough)
}
export function wasDeleted(key: string, id: string) {
    return history.deletedIds[key]?.includes(id) ?? false
}
