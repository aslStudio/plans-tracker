import AsyncStorage from '@react-native-async-storage/async-storage'

const LAST_SHOWN_STORAGE_KEY = 'plans-tracker.tasks-overdue-reminder-last-shown'

/** Claims the reminder for a calendar day so only the first eligible app entry shows it. */
export async function claimOverdueReminderForDay(
    day: string,
): Promise<boolean> {
    const lastShownDay = await AsyncStorage.getItem(LAST_SHOWN_STORAGE_KEY)
    if (lastShownDay === day) return false

    await AsyncStorage.setItem(LAST_SHOWN_STORAGE_KEY, day)
    return true
}
