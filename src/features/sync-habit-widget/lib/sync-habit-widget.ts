import { habitsRepository } from '@/shared/api'
import type { HabitCompletion } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'

import { updateHabitWidget } from '../../../../modules/habit-widget-data'
import { buildHabitWidgetPayload } from './build-habit-widget-payload'

/**
 * Pushes today's habit list + streak to the iOS Home Screen widget — a
 * plain one-shot refresh, call it after anything that could change what
 * the widget should show (app foreground, toggling a completion, applying
 * the widget's own pending toggles — see `applyPendingHabitToggles`).
 * No-op on Android/web, see `updateHabitWidget`.
 */
export async function syncHabitWidget(): Promise<void> {
    const habits = await habitsRepository.list()
    const completionsByHabitId: Record<string, HabitCompletion[]> = {}
    await Promise.all(
        habits.map(async (habit) => {
            completionsByHabitId[habit.id] =
                await habitsRepository.listCompletions(habit.id)
        }),
    )

    const { items, streak } = buildHabitWidgetPayload(
        habits,
        completionsByHabitId,
        todayDateString(),
    )
    updateHabitWidget(items, streak)
}
