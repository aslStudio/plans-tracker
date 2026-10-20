import { fireEvent } from '@testing-library/react-native'

import type { Habit, HabitCompletion } from '@/shared/api'
import { render, screen } from '@/shared/lib/test-utils'

import { HabitStreakScreen } from './HabitStreakScreen'

const today = '2026-10-13'
const habit: Habit = {
    id: 'water',
    title: 'Пить воду',
    repeat: { type: 'daily' },
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
}
const completions: HabitCompletion[] = ['2026-10-12', today].map(
    (occurrenceDate, index) => ({
        id: `completion-${index}`,
        habitId: habit.id,
        occurrenceDate,
        completedAt: '2026-10-13T10:00:00.000Z',
    }),
)

describe('HabitStreakScreen', () => {
    it("shows the all-habits streak and a selected day's habit details", () => {
        render(
            <HabitStreakScreen
                habits={[habit]}
                completionsByHabitId={{ [habit.id]: completions }}
                today={today}
                onClose={jest.fn()}
                onToggleCompletion={jest.fn()}
            />,
        )

        expect(screen.getAllByText('2').length).toBeGreaterThan(0)
        expect(screen.getByText('дня подряд')).toBeTruthy()
        expect(screen.getByText('Пить воду')).toBeTruthy()
    })

    it("opens a past calendar date to inspect that day's progress", () => {
        render(
            <HabitStreakScreen
                habits={[habit]}
                completionsByHabitId={{ [habit.id]: completions }}
                today={today}
                onClose={jest.fn()}
                onToggleCompletion={jest.fn()}
            />,
        )

        fireEvent.press(
            screen.getByRole('button', { name: '2026-10-12, выполнено 100%' }),
        )
        expect(screen.getByText('12 октября')).toBeTruthy()
        expect(screen.getByText('100%', { exact: true })).toBeTruthy()
    })

    it('lets the selected past day be toggled for a due habit', () => {
        const onToggleCompletion = jest.fn()
        render(
            <HabitStreakScreen
                habits={[habit]}
                completionsByHabitId={{ [habit.id]: completions }}
                today={today}
                onClose={jest.fn()}
                onToggleCompletion={onToggleCompletion}
            />,
        )

        fireEvent.press(
            screen.getByRole('button', { name: '2026-10-12, выполнено 100%' }),
        )
        fireEvent.press(
            screen.getByRole('button', {
                name: 'Отметить Пить воду невыполненной за 2026-10-12',
            }),
        )

        expect(onToggleCompletion).toHaveBeenCalledWith(
            habit.id,
            '2026-10-12',
            false,
        )
    })
})
