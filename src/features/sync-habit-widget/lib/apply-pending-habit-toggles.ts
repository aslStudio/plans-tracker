import { habitsRepository } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'

import { takePendingHabitToggles } from '../../../../modules/habit-widget-data'

/**
 * Applies whatever the Habits widget's own tap-to-complete rows queued
 * while the app wasn't running — the widget can only update its own
 * optimistic snapshot (see `HabitsWidget.swift`'s `ToggleHabitIntent`), it
 * has no access to `habitsRepository`/AsyncStorage at all. Call this before
 * `syncHabitWidget` so the widget's next refresh reflects the now-real
 * state instead of just echoing its own guess back.
 */
export async function applyPendingHabitToggles(): Promise<void> {
    const toggles = await takePendingHabitToggles()
    if (toggles.length === 0) return

    const today = todayDateString()
    await Promise.all(
        toggles.map((toggle) =>
            habitsRepository.setCompletion(
                toggle.habitId,
                today,
                toggle.completed,
            ),
        ),
    )
}
