import { getMemoryHistory } from '@/shared/lib/memory/history'
import type { Habit, HabitCompletion } from '@/shared/api'
import { addDays, toLocalDateString } from '@/shared/lib/date'
import { isHabitDueOnDate } from './habit-progress'

export type HabitDayProgress = {
    date: string
    done: number
    total: number
    percentage: number
    isComplete: boolean
}

export function getHabitDayProgress(
    habits: Habit[],
    completionsByHabitId: Record<string, HabitCompletion[]>,
    date: string,
): HabitDayProgress {
    let done = 0
    let total = 0
    for (const habit of habits) {
        if (!isHabitDueOnDate(habit, date)) continue
        total += 1
        if (
            completionsByHabitId[habit.id]?.some(
                (completion) => completion.occurrenceDate === date,
            )
        ) {
            done += 1
        }
    }
    return {
        date,
        done,
        total,
        percentage: total === 0 ? 0 : Math.round((done / total) * 100),
        isComplete: total > 0 && done === total,
    }
}

/** Consecutive calendar days on which every habit scheduled for that date was completed. */
export function computeAllHabitsStreak(
    habits: Habit[],
    completionsByHabitId: Record<string, HabitCompletion[]>,
    today: string,
): number {
    const anchor = getMemoryHistory().global
    if (habits.length === 0) return anchor?.count ?? 0
    if (anchor && today <= anchor.through) return anchor.count
    const firstHabitDate = habits.reduce((earliest, habit) => {
        const created = habit.createdAt.slice(0, 10)
        return created < earliest ? created : earliest
    }, today)

    let cursor = today
    const todayProgress = getHabitDayProgress(
        habits,
        completionsByHabitId,
        today,
    )
    if (!todayProgress.isComplete) cursor = addDays(cursor, -1)

    let streak = 0
    while (cursor >= firstHabitDate || (anchor && cursor >= anchor.through)) {
        if (anchor && cursor <= anchor.through) return streak + anchor.count
        const progress = getHabitDayProgress(
            habits,
            completionsByHabitId,
            cursor,
        )
        if (progress.total > 0) {
            if (!progress.isComplete) break
            streak += 1
        }
        cursor = addDays(cursor, -1)
    }
    return streak
}

export function getHabitMonthProgress(
    habits: Habit[],
    completionsByHabitId: Record<string, HabitCompletion[]>,
    month: Date,
    today: string,
): HabitDayProgress[] {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const count = new Date(year, monthIndex + 1, 0).getDate()
    return Array.from({ length: count }, (_, index) =>
        getHabitDayProgress(
            habits,
            completionsByHabitId,
            toLocalDateString(new Date(year, monthIndex, index + 1)),
        ),
    ).map((day) =>
        day.date > today
            ? { ...day, total: 0, done: 0, percentage: 0, isComplete: false }
            : day,
    )
}
