import { cloud } from './cloud'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    cleanMemory,
    initializeMemory,
    memoryKey,
    syncMemory,
    updateMemorySettings,
} from './service'
import { keys } from './retention'
import { emptyHistory, getMemoryHistory, setMemoryHistory } from './history'
import {
    archiveIndexKey,
    getArchiveIndex,
    setArchive,
    setArchiveIndex,
} from './archive'
import { createLocalCollectionStore } from '@/shared/api/common/local-collection-store'
import { withStorageTransaction } from '@/shared/api/common/storage-transaction'
jest.mock('./cloud', () => ({
    cloud: { account: jest.fn(), read: jest.fn(), write: jest.fn() },
}))
jest.mock('@/shared/lib/diagnostics/app-logger', () => ({
    clearAppLogs: jest.fn(),
    logError: jest.fn(),
    logDebug: jest.fn(),
}))
const native = cloud as jest.Mocked<NonNullable<typeof cloud>>
beforeEach(async () => {
    await AsyncStorage.clear()
    setMemoryHistory(emptyHistory)
    setArchive({})
    setArchiveIndex({})
    jest.clearAllMocks()
    native.account.mockResolvedValue('account')
    native.read.mockResolvedValue(null)
    native.write.mockResolvedValue('tag1')
})
it('never removes local records when cloud saving fails', async () => {
    const task = {
        id: 't',
        title: 'Keep me',
        statusId: 'status-done',
        endDate: '2020-01-01',
        updatedAt: '2020-01-01',
    }
    await AsyncStorage.setItem(keys.tasks, JSON.stringify([task]))
    await updateMemorySettings({ enabled: true })
    native.write.mockRejectedValue(new Error('offline'))
    await expect(syncMemory(true)).rejects.toThrow('offline')
    expect(JSON.parse((await AsyncStorage.getItem(keys.tasks))!)).toEqual([
        task,
    ])
    expect(getArchiveIndex()).toEqual({})
})
it('offloads only after confirmation and materializes an edited archive without resurrecting deletion', async () => {
    const task = {
        id: 't',
        title: 'Keep me',
        statusId: 'status-done',
        endDate: '2020-01-01',
        updatedAt: '2020-01-01',
    }
    await AsyncStorage.setItem(keys.tasks, JSON.stringify([task]))
    await updateMemorySettings({ enabled: true })
    await syncMemory(true)
    expect(await AsyncStorage.getItem(keys.tasks)).toBe('[]')
    expect(getArchiveIndex()[keys.tasks]).toEqual(['t'])
    const store = createLocalCollectionStore<typeof task>(keys.tasks)
    expect(await store.get('t')).toEqual(task)
    await store.remove('t')
    const payload = native.write.mock.calls[0][0]
    native.read.mockResolvedValue({ payload, tag: 'tag1' })
    await syncMemory(true)
    expect(JSON.parse(native.write.mock.calls[1][0]).data[keys.tasks]).toEqual(
        [],
    )
})
it('replays an interrupted deletion before the next write', async () => {
    await AsyncStorage.setItem(
        'plans-tracker.memory-transaction',
        JSON.stringify([
            [keys.tasks, '[]'],
            [
                'plans-tracker.memory-history',
                JSON.stringify({
                    ...emptyHistory,
                    global: { through: '2026-10-14', count: 42 },
                }),
            ],
        ]),
    )
    await initializeMemory()
    expect(getMemoryHistory().global?.count).toBe(42)
    expect(
        await AsyncStorage.getItem('plans-tracker.memory-transaction'),
    ).toBeNull()
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
it('will not delete a cold archive while it cannot read it', async () => {
    setArchiveIndex({ [keys.tasks]: ['t'] })
    await AsyncStorage.setItem(
        archiveIndexKey,
        JSON.stringify(getArchiveIndex()),
    )
    await AsyncStorage.setItem(
        memoryKey,
        JSON.stringify({
            enabled: true,
            interval: 'day',
            tag: 'tag1',
            account: 'account',
        }),
    )
    native.read.mockRejectedValue(new Error('offline'))
    await expect(cleanMemory('all', () => {})).rejects.toThrow('offline')
    expect(getArchiveIndex()[keys.tasks]).toEqual(['t'])
    expect(getMemoryHistory()).toEqual(emptyHistory)
})
it('rejects a different iCloud account before reading or writing data', async () => {
    await AsyncStorage.setItem(
        memoryKey,
        JSON.stringify({
            enabled: true,
            interval: 'day',
            account: 'previous-account',
        }),
    )
    await expect(syncMemory(true)).rejects.toThrow('Аккаунт iCloud изменился')
    expect(native.read).not.toHaveBeenCalled()
    expect(native.write).not.toHaveBeenCalled()
})
