import { t } from '@/shared/lib/i18n'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import {
    habitsRepository,
    notificationsRepository,
    tasksRepository,
    type HabitCompletion,
} from '@/shared/api'
import { calendarRepository } from '@/shared/api/calendar/repository'
import { todayDateString } from '@/shared/lib/date'
import { logInfo } from '@/shared/lib/diagnostics/app-logger'

import {
    planAllNotifications,
    type NotificationPlanInput,
} from './schedule-plan'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
})

export async function setUpNotificationChannel(): Promise<void> {
    if (Platform.OS !== 'android') return
    await Notifications.setNotificationChannelAsync('default', {
        name: t('Задачи, привычки и календарь'),
        importance: Notifications.AndroidImportance.DEFAULT,
    })
}

/** Requests the system permission and persists the result as `enabled` — the single gate every per-group toggle in settings sits behind. */
export async function requestNotificationPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: false },
    })
    const granted = status === 'granted'
    await notificationsRepository.update({ enabled: granted })
    return granted
}

async function loadPlanInput(): Promise<NotificationPlanInput> {
    const [tasks, statuses, taskCompletions, habits, habitCompletions, events] =
        await Promise.all([
            tasksRepository.list(),
            tasksRepository.listStatuses(),
            tasksRepository.listAllCompletions(),
            habitsRepository.list(),
            habitsRepository.listAllCompletions(),
            calendarRepository.list(),
        ])

    const completionsByHabitId: Record<string, HabitCompletion[]> = {}
    for (const completion of habitCompletions) {
        ;(completionsByHabitId[completion.habitId] ??= []).push(completion)
    }

    return {
        tasks: { tasks, statuses, completions: taskCompletions },
        habits: { habits, completionsByHabitId },
        calendar: { events },
    }
}

/**
 * Fully replaces the on-device notification queue with a fresh plan for
 * today (and the next couple of days, for calendar events) — local
 * notifications can't re-evaluate their own condition at fire time, so
 * instead of leaving stale ones around this recomputes from scratch on every
 * call. Cheap to call often: it's the only `expo-notifications` consumer in
 * the app, so there's nothing else to preserve by cancelling selectively.
 */
export async function rescheduleNotifications(): Promise<void> {
    const settings = await notificationsRepository.get()
    await Notifications.cancelAllScheduledNotificationsAsync()
    if (!settings.enabled) return

    const input = await loadPlanInput()
    const plans = planAllNotifications(
        settings,
        input,
        todayDateString(),
        new Date(),
    )

    await Promise.all(
        plans.map((plan) =>
            Notifications.scheduleNotificationAsync({
                content: { title: plan.title, body: plan.body },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: plan.date,
                },
            }),
        ),
    )

    void logInfo('notifications', 'rescheduled', { count: plans.length })
}
