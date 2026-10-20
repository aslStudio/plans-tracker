import AsyncStorage from '@react-native-async-storage/async-storage'

import { createLocalCollectionStore } from './local-collection-store'

type Item = { id: string; label: string }

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('createLocalCollectionStore', () => {
    it('starts empty', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        expect(await store.list()).toEqual([])
        expect(await store.get('missing')).toBeNull()
    })

    it('inserts and lists items', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        await store.insert({ id: '1', label: 'First' })
        await store.insert({ id: '2', label: 'Second' })

        expect(await store.list()).toEqual([
            { id: '1', label: 'First' },
            { id: '2', label: 'Second' },
        ])
    })

    it('updates an item by merging the patch', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        await store.insert({ id: '1', label: 'First' })

        const updated = await store.update('1', { label: 'Renamed' })

        expect(updated).toEqual({ id: '1', label: 'Renamed' })
        expect(await store.get('1')).toEqual({ id: '1', label: 'Renamed' })
    })

    it('throws when updating a missing item', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        await expect(store.update('missing', { label: 'x' })).rejects.toThrow()
    })

    it('removes an item', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        await store.insert({ id: '1', label: 'First' })
        await store.remove('1')

        expect(await store.list()).toEqual([])
    })

    it('upserts by inserting when no match exists', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        const result = await store.upsert(
            (item) => item.id === '1',
            () => ({ id: '1', label: 'Created' }),
            (item) => ({ ...item, label: 'Patched' }),
        )

        expect(result).toEqual({ id: '1', label: 'Created' })
        expect(await store.list()).toEqual([{ id: '1', label: 'Created' }])
    })

    it('upserts by patching the existing match', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        await store.insert({ id: '1', label: 'Created' })

        const result = await store.upsert(
            (item) => item.id === '1',
            () => ({ id: '1', label: 'Created' }),
            (item) => ({ ...item, label: 'Patched' }),
        )

        expect(result).toEqual({ id: '1', label: 'Patched' })
        expect(await store.list()).toEqual([{ id: '1', label: 'Patched' }])
    })

    it('seeds defaults only when the store is empty', async () => {
        const store = createLocalCollectionStore<Item>('test.items')
        await store.seedIfEmpty([{ id: '1', label: 'Default' }])
        await store.seedIfEmpty([{ id: '2', label: 'Should not apply' }])

        expect(await store.list()).toEqual([{ id: '1', label: 'Default' }])
    })

    it('serializes concurrent mutations instead of losing writes', async () => {
        const store = createLocalCollectionStore<Item>('test.items')

        await Promise.all([
            store.insert({ id: '1', label: 'First' }),
            store.insert({ id: '2', label: 'Second' }),
            store.insert({ id: '3', label: 'Third' }),
        ])

        const items = await store.list()
        expect(items).toHaveLength(3)
        expect(items.map((item) => item.id).sort()).toEqual(['1', '2', '3'])
    })
})
