import type { Habit, HabitCompletion } from '@/shared/api'
import { computeAllHabitsStreak, isHabitDueOnDate } from '@/entities/habit'

import type { WidgetHabitItem } from '../../../../modules/habit-widget-data'

export type HabitWidgetPayload = {
    items: WidgetHabitItem[]
    streak: number
}

/** Today's due habits, each flagged by whether it's already completed — the widget derives its own done/total straight from this list, no separate counts to keep in sync. */
export function buildHabitWidgetPayload(
    habits: Habit[],
    completionsByHabitId: Record<string, HabitCompletion[]>,
    today: string,
): HabitWidgetPayload {
    const items: WidgetHabitItem[] = habits
        .filter((habit) => isHabitDueOnDate(habit, today))
        .map((habit) => ({
            id: habit.id,
            title: habit.title,
            completed:
                completionsByHabitId[habit.id]?.some(
                    (completion) => completion.occurrenceDate === today,
                ) ?? false,
        }))

    return {
        items,
        streak: computeAllHabitsStreak(habits, completionsByHabitId, today),
    }
}
