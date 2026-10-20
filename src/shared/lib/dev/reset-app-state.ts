import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { DevSettings } from 'react-native'
import { clearCalendarWidgetData } from '../../../../modules/calendar-widget-data'
import { clearHabitWidgetData } from '../../../../modules/habit-widget-data'
import { clearTaskWidgetData } from '../../../../modules/task-widget-data'
import { emptyHistory, setMemoryHistory } from '@/shared/lib/memory/history'
import { setArchive, setArchiveIndex } from '@/shared/lib/memory/archive'
import { initializeMemory } from '@/shared/lib/memory/service'

/** Restore local app data and OS-managed scheduled reminders to their fresh-install defaults. */
export async function resetAppState(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.setBadgeCountAsync(0)

    const keys = await AsyncStorage.getAllKeys()
    const appKeys = keys.filter(
        (key) => key.startsWith('plans-tracker.') || key.startsWith('plans-tracker.theme.'),
    )
    if (appKeys.length) await AsyncStorage.multiRemove(appKeys)

    setMemoryHistory(emptyHistory)
    setArchive({})
    setArchiveIndex({})
    clearTaskWidgetData()
    clearHabitWidgetData()
    clearCalendarWidgetData()
    await initializeMemory()
}

/** Reset local state and reload the JS bundle so the app re-evaluates onboarding from scratch, as on first launch. */
export async function resetAppToFirstLaunch(): Promise<void> {
    await resetAppState()
    DevSettings.reload()
}
