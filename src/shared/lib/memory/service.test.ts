import AsyncStorage from '@react-native-async-storage/async-storage'
import { cloud } from './cloud'
import { cleanMemory, hydrateArchive, initializeMemory, memoryKey, syncMemory } from './service'
import { assertSyncOwner, baseKey, readRemoteSnapshot, writeRemoteSnapshot, type Snapshot } from './backend-snapshot'
import { keys } from './retention'
import { emptyHistory, getMemoryHistory, setMemoryHistory } from './history'
import { archiveIndexKey, getArchiveIndex, setArchive, setArchiveIndex } from './archive'
import { createLocalCollectionStore } from '@/shared/api/common/local-collection-store'
import { withStorageTransaction } from '@/shared/api/common/storage-transaction'

jest.mock('./cloud', () => ({ cloud: { account: jest.fn(), read: jest.fn() } }))
jest.mock('./backend-snapshot', () => ({
    ...jest.requireActual('./backend-snapshot'),
    assertSyncOwner: jest.fn(async () => 'user'),
    readRemoteSnapshot: jest.fn(),
    writeRemoteSnapshot: jest.fn(),
}))
jest.mock('@/shared/lib/auth/session', () => ({ currentUser: jest.fn(() => ({ id: 'user' })) }))
jest.mock('@/shared/lib/diagnostics/app-logger', () => ({ clearAppLogs: jest.fn(), logError: jest.fn(), logDebug: jest.fn() }))

const native = cloud as jest.Mocked<NonNullable<typeof cloud>>
const remoteRead = jest.mocked(readRemoteSnapshot)
const remoteWrite = jest.mocked(writeRemoteSnapshot)
const task = { id: 't', title: 'Keep me', statusId: 'status-done', endDate: '2020-01-01', updatedAt: '2020-01-01' }

beforeEach(async () => {
    await AsyncStorage.clear()
    setMemoryHistory(emptyHistory)
    setArchive({})
    setArchiveIndex({})
    jest.clearAllMocks()
    native.account.mockResolvedValue('old-icloud-account')
    native.read.mockResolvedValue(null)
    jest.mocked(assertSyncOwner).mockResolvedValue('user')
    remoteRead.mockResolvedValue({ revision: 0, payload: null })
    remoteWrite.mockResolvedValue(1)
})

it('keeps records on the device after uploading to the server', async () => {
    await AsyncStorage.setItem(keys.tasks, JSON.stringify([task]))
    await syncMemory(true)
    expect(JSON.parse((await AsyncStorage.getItem(keys.tasks))!)).toEqual([task])
    expect(remoteWrite).toHaveBeenCalledWith(0, expect.objectContaining({ data: expect.objectContaining({ [keys.tasks]: [task] }) }))
    expect(JSON.parse((await AsyncStorage.getItem(baseKey))!).revision).toBe(1)
    expect(getArchiveIndex()).toEqual({})
})

it('preserves local edits if the server cannot save', async () => {
    await AsyncStorage.setItem(keys.tasks, JSON.stringify([task]))
    remoteWrite.mockRejectedValueOnce(new Error('server unavailable'))
    await expect(syncMemory(true)).rejects.toThrow('server unavailable')
    expect(JSON.parse((await AsyncStorage.getItem(keys.tasks))!)).toEqual([task])
    expect(await AsyncStorage.getItem(baseKey)).toBeNull()
})

it('downloads an existing account to a device without user records', async () => {
    const payload: Snapshot = { version: 2, data: { [keys.tasks]: [task] }, history: emptyHistory, values: {} }
    remoteRead.mockResolvedValue({ revision: 7, payload })
    await syncMemory(true)
    expect(JSON.parse((await AsyncStorage.getItem(keys.tasks))!)).toEqual([task])
    expect(remoteWrite).not.toHaveBeenCalled()
})

it('materializes records offloaded by an older iCloud build', async () => {
    setArchiveIndex({ [keys.tasks]: ['t'] })
    await AsyncStorage.setItem(archiveIndexKey, JSON.stringify(getArchiveIndex()))
    await AsyncStorage.setItem(memoryKey, JSON.stringify({ tag: 'old-tag', account: 'old-icloud-account' }))
    native.read.mockResolvedValue({
        tag: 'old-tag',
        payload: JSON.stringify({
            version: 1,
            data: Object.fromEntries(Object.values(keys).map((key) => [key, key === keys.tasks ? [task] : []])),
            history: emptyHistory,
        }),
    })
    await hydrateArchive()
    expect(JSON.parse((await AsyncStorage.getItem(keys.tasks))!)).toEqual([task])
    expect(getArchiveIndex()).toEqual({})
})

it('replays an interrupted transaction before the next write', async () => {
    await AsyncStorage.setItem('plans-tracker.memory-transaction', JSON.stringify([
        [keys.tasks, '[]'],
        ['plans-tracker.memory-history', JSON.stringify({ ...emptyHistory, global: { through: '2026-10-14', count: 42 } })],
    ]))
    await initializeMemory()
    expect(getMemoryHistory().global?.count).toBe(42)
    expect(await AsyncStorage.getItem('plans-tracker.memory-transaction')).toBeNull()
})

it('serializes maintenance and normal writes', async () => {
    const store = createLocalCollectionStore<{ id: string }>(keys.tasks)
    await Promise.all([
        store.insert({ id: 'before' }),
        withStorageTransaction(() => AsyncStorage.setItem(keys.tasks, '[]')),
        store.insert({ id: 'after' }),
    ])
    expect(await store.list()).toEqual([{ id: 'after' }])
})

it('does not delete a legacy archive when it cannot be read', async () => {
    setArchiveIndex({ [keys.tasks]: ['t'] })
    await AsyncStorage.setItem(archiveIndexKey, JSON.stringify(getArchiveIndex()))
    await AsyncStorage.setItem(memoryKey, JSON.stringify({ tag: 'old-tag', account: 'old-icloud-account' }))
    native.read.mockRejectedValue(new Error('offline'))
    await expect(cleanMemory('all', () => {})).rejects.toThrow('offline')
    expect(getArchiveIndex()[keys.tasks]).toEqual(['t'])
})

it('blocks data from syncing to another account', async () => {
    jest.mocked(assertSyncOwner).mockRejectedValueOnce(new Error('other account'))
    await expect(syncMemory(true)).rejects.toThrow('other account')
    expect(remoteRead).not.toHaveBeenCalled()
    expect(remoteWrite).not.toHaveBeenCalled()
})
