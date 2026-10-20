import AsyncStorage from '@react-native-async-storage/async-storage'

import { createLocalValueStore } from './local-value-store'

type Settings = { useGroups: boolean; usePriority: boolean }

const defaultValue: Settings = { useGroups: true, usePriority: true }

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('createLocalValueStore', () => {
    it('starts at the default value', async () => {
        const store = createLocalValueStore<Settings>(
            'test.settings',
            defaultValue,
        )
        expect(await store.get()).toEqual(defaultValue)
    })

    it('persists a patch and merges it over the previous value', async () => {
        const store = createLocalValueStore<Settings>(
            'test.settings',
            defaultValue,
        )
        await store.update({ useGroups: false })

        expect(await store.get()).toEqual({
            useGroups: false,
            usePriority: true,
        })
    })

    it('fills in a default for a field missing from an older persisted blob', async () => {
        await AsyncStorage.setItem(
            'test.settings',
            JSON.stringify({ useGroups: false }),
        )
        const store = createLocalValueStore<Settings>(
            'test.settings',
            defaultValue,
        )

        expect(await store.get()).toEqual({
            useGroups: false,
            usePriority: true,
        })
    })

    it('keeps separate stores under different keys independent', async () => {
        const a = createLocalValueStore<Settings>('test.a', defaultValue)
        const b = createLocalValueStore<Settings>('test.b', defaultValue)
        await a.update({ useGroups: false })

        expect(await a.get()).toEqual({ useGroups: false, usePriority: true })
        expect(await b.get()).toEqual(defaultValue)
    })
})
