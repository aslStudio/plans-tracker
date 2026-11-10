import AsyncStorage from '@react-native-async-storage/async-storage'
import { authorizedRequest, currentUser } from '@/shared/lib/auth/session'
import type { Collections, StoredRecord } from './retention'
import type { MemoryHistory } from './history'

export const baseKey = 'plans-tracker.sync-base'
export const ownerKey = 'plans-tracker.sync-owner'
export const syncedValueKeys = [
    'plans-tracker.settings',
    'plans-tracker.calendar-settings',
    'plans-tracker.notification-settings',
] as const

export type Snapshot = {
    version: 2
    data: Collections
    history: MemoryHistory
    values: Record<string, unknown>
}
export type RemoteSnapshot = { revision: number; payload: Snapshot | null }
export type SavedBase = { userId: string; revision: number; payload: Snapshot }

function same(a: unknown, b: unknown) {
    return JSON.stringify(a) === JSON.stringify(b)
}

function choose<T>(base: T | undefined, local: T | undefined, remote: T | undefined): T | undefined {
    if (same(local, base)) return remote
    if (same(remote, base)) return local
    if (same(local, remote)) return local
    if (base === undefined && local !== undefined && remote !== undefined) return remote
    const localTime = (local as { updatedAt?: string } | undefined)?.updatedAt
    const remoteTime = (remote as { updatedAt?: string } | undefined)?.updatedAt
    if (localTime && remoteTime) return remoteTime > localTime ? remote : local
    return local
}

export function mergeSnapshots(base: Snapshot | null, local: Snapshot, remote: Snapshot | null): Snapshot {
    if (!remote) return local
    const data: Collections = {}
    const collectionKeys = new Set([
        ...Object.keys(base?.data ?? {}),
        ...Object.keys(local.data),
        ...Object.keys(remote.data),
    ])
    for (const key of collectionKeys) {
        const b = new Map((base?.data[key] ?? []).map((item) => [item.id, item]))
        const l = new Map((local.data[key] ?? []).map((item) => [item.id, item]))
        const r = new Map((remote.data[key] ?? []).map((item) => [item.id, item]))
        const ids = new Set([...b.keys(), ...l.keys(), ...r.keys()])
        data[key] = [...ids]
            .map((id) => choose<StoredRecord>(b.get(id), l.get(id), r.get(id)))
            .filter((item): item is StoredRecord => item !== undefined)
    }
    const values: Record<string, unknown> = {}
    for (const key of new Set([
        ...Object.keys(base?.values ?? {}),
        ...Object.keys(local.values),
        ...Object.keys(remote.values),
    ])) {
        values[key] = choose(base?.values[key], local.values[key], remote.values[key])
    }
    return {
        version: 2,
        data,
        history: choose(base?.history, local.history, remote.history) ?? local.history,
        values,
    }
}

export async function readSavedBase(): Promise<SavedBase | null> {
    const raw = await AsyncStorage.getItem(baseKey)
    if (!raw) return null
    try {
        const value = JSON.parse(raw) as SavedBase
        return value?.payload?.version === 2 ? value : null
    } catch {
        return null
    }
}

export async function readRemoteSnapshot(): Promise<RemoteSnapshot> {
    const response = await authorizedRequest('/v1/auth/snapshot')
    if (!response.ok) throw new Error(`snapshot read failed: ${response.status}`)
    const value = (await response.json()) as RemoteSnapshot
    if (!Number.isSafeInteger(value.revision) || value.revision < 0 || (value.payload !== null && value.payload?.version !== 2))
        throw new Error('unsupported server snapshot')
    return value
}

export async function writeRemoteSnapshot(expectedRevision: number, payload: Snapshot): Promise<number | null> {
    const response = await authorizedRequest('/v1/auth/snapshot', {
        method: 'PUT',
        body: JSON.stringify({ expected_revision: expectedRevision, payload }),
    })
    if (response.status === 409) return null
    if (!response.ok) throw new Error(`snapshot write failed: ${response.status}`)
    const value = (await response.json()) as { revision: number }
    if (!Number.isSafeInteger(value.revision) || value.revision <= expectedRevision)
        throw new Error('invalid snapshot revision')
    return value.revision
}

export async function assertSyncOwner() {
    const user = currentUser()
    if (!user) return null
    const owner = await AsyncStorage.getItem(ownerKey)
    if (owner && owner !== user.id)
        throw new Error('Данные на устройстве связаны с другим аккаунтом. Синхронизация остановлена.')
    return user.id
}
