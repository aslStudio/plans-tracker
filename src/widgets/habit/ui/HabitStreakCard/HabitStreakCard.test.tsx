import type { Habit, HabitCompletion } from '@/shared/api'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { HabitStreakCard } from './HabitStreakCard'

const habits: Habit[] = [
    {
        id: 'h1',
        title: 'Тренировка',
        repeat: { type: 'daily' },
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
    },
]

const completionsByHabitId: Record<string, HabitCompletion[]> = {
    h1: [
        {
            id: 'c1',
            habitId: 'h1',
            occurrenceDate: '2026-10-14',
            completedAt: '2026-10-14T08:00:00.000Z',
        },
    ],
}

describe('HabitStreakCard', () => {
    it('renders the current streak', () => {
        render(
            <HabitStreakCard
                habits={habits}
                completionsByHabitId={completionsByHabitId}
                today="2026-10-14"
                selectedDate="2026-10-14"
                onPress={() => {}}
                onSelectDate={() => {}}
            />,
        )

        expect(screen.getByText('Серия привычек')).toBeTruthy()
    })

    it('calls onPress when the header is pressed', () => {
        const onPress = jest.fn()
        render(
            <HabitStreakCard
                habits={habits}
                completionsByHabitId={completionsByHabitId}
                today="2026-10-14"
                selectedDate="2026-10-14"
                onPress={onPress}
                onSelectDate={() => {}}
            />,
        )

        fireEvent.press(screen.getByText('Серия привычек'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })
})
