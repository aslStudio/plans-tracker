import { t, useLanguage } from '@/shared/lib/i18n'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import {
    defaultAppSettings,
    habitsRepository,
    settingsRepository,
} from '@/shared/api'
import type {
    AppSettings,
    Habit,
    HabitCategory,
    HabitCompletion,
} from '@/shared/api'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { logError } from '@/shared/lib/diagnostics/app-logger'
import { rescheduleNotifications } from '@/features/manage-notification-settings'
import { SwipeableRowsCoordinatorProvider } from '@/shared/lib/swipeable-rows-coordinator'

import { HabitsScreen } from '@/screens/HabitsScreen'

async function loadHabits(): Promise<{
    habits: Habit[]
    categories: HabitCategory[]
    completionsByHabitId: Record<string, HabitCompletion[]>
    settings: AppSettings
}> {
    const [habits, categories, settings] = await Promise.all([
        habitsRepository.list(),
        habitsRepository.listCategories(),
        settingsRepository.get(),
    ])
    const completionsByHabitId: Record<string, HabitCompletion[]> = {}
    await Promise.all(
        habits.map(async (habit) => {
            completionsByHabitId[habit.id] =
                await habitsRepository.listCompletions(habit.id)
        }),
    )
    return { habits, categories, completionsByHabitId, settings }
}

export default function HabitsRoute() {
    const language = useLanguage()

    const router = useRouter()
    const [habits, setHabits] = useState<Habit[]>([])
    const [categories, setCategories] = useState<HabitCategory[]>([])
    const [completionsByHabitId, setCompletionsByHabitId] = useState<
        Record<string, HabitCompletion[]>
    >({})
    const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)
    const [isLoading, setIsLoading] = useState(true)

    // Refetches on every focus, not just mount — closing the habit
    // create/edit modal (or the settings screen) returns focus here, exactly
    // when a new habit, an edited field, a fresh completion, or a toggled
    // setting needs to show up.
    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            async function load() {
                const next = await loadHabits()
                setHabits(next.habits)
                setCategories(next.categories)
                setCompletionsByHabitId(next.completionsByHabitId)
                setSettings(next.settings)
                setIsLoading(false)
                void rescheduleNotifications().catch((error) =>
                    logError('notifications', 'reschedule_failed', error),
                )
            }
            void load()
        }, [language]),
    )

    async function refresh() {
        const next = await loadHabits()
        setHabits(next.habits)
        setCategories(next.categories)
        setCompletionsByHabitId(next.completionsByHabitId)
        setSettings(next.settings)
    }

    return (
        <SwipeableRowsCoordinatorProvider>
            <HabitsScreen
                habits={habits}
                categories={categories}
                useCategories={settings.useHabitCategories}
                completionsByHabitId={completionsByHabitId}
                isLoading={isLoading}
                onAddHabit={() => router.push('/habit/new')}
                onOpenHabit={(habitId) => router.push(`/habit/${habitId}`)}
                onDeleteHabit={(habitId) => {
                    void habitsRepository.remove(habitId).then(() => {
                        showAppToast({
                            title: t('Привычка удалена'),
                            description: t('Она удалена из вашего списка'),
                            animation: 'done',
                        })
                        return refresh()
                    })
                }}
                onToggleCompletion={(habitId, date) => {
                    void habitsRepository
                        .toggleCompletion(habitId, date)
                        .then(refresh)
                }}
                onOpenSettings={() =>
                    router.push({
                        pathname: '/settings',
                        params: { from: 'habits' },
                    })
                }
                onOpenStatistics={(category) =>
                    router.push({
                        pathname: '/statistics',
                        params: {
                            kind: 'habits',
                            ...(category ? { filter: category } : {}),
                        },
                    })
                }
                onOpenStreak={() => router.push('/habit-streak')}
            />
        </SwipeableRowsCoordinatorProvider>
    )
}
