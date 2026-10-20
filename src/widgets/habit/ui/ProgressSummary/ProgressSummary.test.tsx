import { screen } from '@testing-library/react-native'

import { render } from '@/shared/lib/test-utils'

import { ProgressSummary } from './ProgressSummary'

const now = new Date().toISOString()
const today = '2026-10-12'

// Mon(1)/Wed(3)/Fri(5)
const weeklyHabit = {
    id: 'h1',
    title: 'Тренировка',
    repeat: { type: 'weekly' as const, daysOfWeek: [1, 3, 5] as [1, 3, 5] },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: now,
}

describe('ProgressSummary', () => {
    it('shows "Сегодня" and today\'s own done/total', () => {
        render(
            <ProgressSummary
                habits={[weeklyHabit]}
                completionsByHabitId={{}}
                today={today}
            />,
        )

        expect(screen.getByText('Сегодня')).toBeTruthy()
        expect(screen.getByText('Выполнено 0%')).toBeTruthy()
    })

    it("counts a completion towards today's total", () => {
        const completionsByHabitId = {
            h1: [
                {
                    id: 'c1',
                    habitId: 'h1',
                    occurrenceDate: today,
                    completedAt: now,
                },
            ],
        }
        render(
            <ProgressSummary
                habits={[weeklyHabit]}
                completionsByHabitId={completionsByHabitId}
                today={today}
            />,
        )

        expect(screen.getByText('Выполнено 100%')).toBeTruthy()
    })

    it('shows "Нет привычек" when nothing is due at all', () => {
        render(
            <ProgressSummary
                habits={[]}
                completionsByHabitId={{}}
                today={today}
            />,
        )

        expect(screen.getByText('Нет привычек')).toBeTruthy()
    })
})
