import AsyncStorage from '@react-native-async-storage/async-storage'

import { claimOverdueReminderForDay } from './overdue-reminder'

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('claimOverdueReminderForDay', () => {
    it('shows once per date and allows the reminder again on a new date', async () => {
        await expect(claimOverdueReminderForDay('2026-10-13')).resolves.toBe(
            true,
        )
        await expect(claimOverdueReminderForDay('2026-10-13')).resolves.toBe(
            false,
        )
        await expect(claimOverdueReminderForDay('2026-10-14')).resolves.toBe(
            true,
        )
    })
})
