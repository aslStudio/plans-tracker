import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import type { Habit, HabitCompletion } from '@/shared/api'
import { habitsRepository } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'
import { HabitStreakScreen } from '@/screens/HabitStreakScreen/HabitStreakScreen'

export default function HabitStreakRoute() {
    const router = useRouter()
    const [habits, setHabits] = useState<Habit[]>([])
    const [completionsByHabitId, setCompletionsByHabitId] = useState<
        Record<string, HabitCompletion[]>
    >({})

    useFocusEffect(
        useCallback(() => {
            async function load() {
                const nextHabits = await habitsRepository.list()
                const completions: Record<string, HabitCompletion[]> = {}
                await Promise.all(
                    nextHabits.map(async (habit) => {
                        completions[habit.id] =
                            await habitsRepository.listCompletions(habit.id)
                    }),
                )
                setHabits(nextHabits)
                setCompletionsByHabitId(completions)
            }
            void load()
        }, []),
    )

    return (
        <HabitStreakScreen
            habits={habits}
            completionsByHabitId={completionsByHabitId}
            today={todayDateString()}
            onClose={() => router.back()}
            onToggleCompletion={(habitId, date, completed) => {
                void habitsRepository
                    .setCompletion(habitId, date, completed)
                    .then((completion) => {
                        setCompletionsByHabitId((current) => ({
                            ...current,
                            [habitId]: [
                                ...(current[habitId] ?? []).filter(
                                    (item) => item.occurrenceDate !== date,
                                ),
                                ...(completion ? [completion] : []),
                            ],
                        }))
                    })
            }}
        />
    )
}
