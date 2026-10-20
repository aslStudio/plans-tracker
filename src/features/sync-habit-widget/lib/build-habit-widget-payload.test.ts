import type { Habit, HabitCompletion } from '@/shared/api'

import { buildHabitWidgetPayload } from './build-habit-widget-payload'

const today = '2026-10-14'

const dailyHabit: Habit = {
    id: 'h1',
    title: 'Выпить воды',
    repeat: { type: 'daily' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

const weeklyHabitNotDueToday: Habit = {
    id: 'h2',
    title: 'Генеральная уборка',
    // 2026-10-14 is a Wednesday (3) — due only on Sunday (0) here.
    repeat: { type: 'weekly', daysOfWeek: [0] },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('buildHabitWidgetPayload', () => {
    it('includes only habits due today', () => {
        const { items } = buildHabitWidgetPayload(
            [dailyHabit, weeklyHabitNotDueToday],
            {},
            today,
        )

        expect(items).toEqual([
            { id: 'h1', title: 'Выпить воды', completed: false },
        ])
    })

    it('flags a habit completed when there is a completion for today', () => {
        const completionsByHabitId: Record<string, HabitCompletion[]> = {
            h1: [
                {
                    id: 'c1',
                    habitId: 'h1',
                    occurrenceDate: today,
                    completedAt: `${today}T08:00:00.000Z`,
                },
            ],
        }

        const { items } = buildHabitWidgetPayload(
            [dailyHabit],
            completionsByHabitId,
            today,
        )

        expect(items).toEqual([
            { id: 'h1', title: 'Выпить воды', completed: true },
        ])
    })

    it('reports the all-habits streak alongside the items', () => {
        const completionsByHabitId: Record<string, HabitCompletion[]> = {
            h1: [
                {
                    id: 'c1',
                    habitId: 'h1',
                    occurrenceDate: '2026-10-13',
                    completedAt: '2026-10-13T08:00:00.000Z',
                },
                {
                    id: 'c2',
                    habitId: 'h1',
                    occurrenceDate: today,
                    completedAt: `${today}T08:00:00.000Z`,
                },
            ],
        }

        const { streak } = buildHabitWidgetPayload(
            [dailyHabit],
            completionsByHabitId,
            today,
        )

        expect(streak).toBe(2)
    })
})
