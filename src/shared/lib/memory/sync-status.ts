import { useSyncExternalStore } from 'react'

type SyncStatus = { offline: boolean }
let status: SyncStatus = { offline: false }
const listeners = new Set<() => void>()

export function setSyncOffline(offline: boolean) {
    if (status.offline === offline) return
    status = { offline }
    listeners.forEach((listener) => listener())
}

export function useSyncStatus() {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        () => status,
        () => status,
    )
}
