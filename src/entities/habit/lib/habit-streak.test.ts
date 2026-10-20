import type { Habit, HabitCompletion } from '@/shared/api'
import {
    computeAllHabitsStreak,
    getHabitDayProgress,
    getHabitMonthProgress,
} from './habit-streak'

const createdAt = '2026-10-01T12:00:00.000Z'
const habits: Habit[] = [
    {
        id: 'daily',
        title: 'Ежедневная',
        repeat: { type: 'daily' },
        createdAt,
        updatedAt: createdAt,
    },
    {
        id: 'monday',
        title: 'По понедельникам',
        repeat: { type: 'weekly', daysOfWeek: [1] },
        createdAt,
        updatedAt: createdAt,
    },
]
const completions: Record<string, HabitCompletion[]> = {
    daily: ['2026-10-11', '2026-10-12', '2026-10-13'].map(
        (occurrenceDate, index) => ({
            id: String(index),
            habitId: 'daily',
            occurrenceDate,
            completedAt: createdAt,
        }),
    ),
    monday: [
        {
            id: 'monday-1',
            habitId: 'monday',
            occurrenceDate: '2026-10-12',
            completedAt: createdAt,
        },
    ],
}

describe('habit streak progress', () => {
    it('calculates progress against only habits scheduled for the date', () => {
        expect(
            getHabitDayProgress(habits, completions, '2026-10-12'),
        ).toMatchObject({
            done: 2,
            total: 2,
            percentage: 100,
            isComplete: true,
        })
    })

    it('counts days where all scheduled habits were completed and keeps today open', () => {
        expect(computeAllHabitsStreak(habits, completions, '2026-10-13')).toBe(
            3,
        )
        expect(computeAllHabitsStreak(habits, completions, '2026-10-14')).toBe(
            3,
        )
    })

    it('returns daily month progress through today and zeros future dates', () => {
        const days = getHabitMonthProgress(
            habits,
            completions,
            new Date(2026, 9, 1),
            '2026-10-13',
        )
        expect(days[11]).toMatchObject({ done: 2, total: 2, percentage: 100 })
        expect(days[13]).toMatchObject({ total: 0, percentage: 0 })
    })
})
