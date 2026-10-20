import AsyncStorage from '@react-native-async-storage/async-storage'

import { settingsRepository } from './settings-repository'

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('settingsRepository', () => {
    it('defaults every extension to off', async () => {
        expect(await settingsRepository.get()).toEqual({
            useGroups: false,
            usePriority: false,
            useHabitCategories: false,
            taskDaysAhead: 1,
            taskRecurrenceEnabled: false,
            taskTimeEnabled: false,
        })
    })

    it('persists a partial update', async () => {
        await settingsRepository.update({ useGroups: true })

        expect(await settingsRepository.get()).toEqual({
            useGroups: true,
            usePriority: false,
            useHabitCategories: false,
            taskDaysAhead: 1,
            taskRecurrenceEnabled: false,
            taskTimeEnabled: false,
        })
    })
})
