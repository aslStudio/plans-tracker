import { fireEvent } from '@testing-library/react-native'

import { formatMonthLabel } from '@/shared/lib/calendar-grid'
import { render, screen } from '@/shared/lib/test-utils'

import { HabitMonthProgress } from './HabitMonthProgress'

const now = new Date().toISOString()
const today = '2026-10-12'
// Fixed, well before `today` — unlike the real `now`, this must never drift
// past the pinned `today` above, or every day in the fixture month would
// read as "before creation" and break the fixed expectations below.
const createdAt = '2026-01-01T00:00:00.000Z'

const habit = {
    id: '1',
    title: 'Пить воду',
    categoryId: null,
    repeat: { type: 'daily' as const },
    createdAt,
    updatedAt: createdAt,
}

describe('HabitMonthProgress', () => {
    it('shows the current month by default', () => {
        render(
            <HabitMonthProgress habit={habit} completions={[]} today={today} />,
        )

        expect(
            screen.getByText(formatMonthLabel(new Date(2026, 9, 1))),
        ).toBeTruthy()
    })

    it('counts completed days towards the month completion rate', () => {
        const completions = [
            {
                id: 'c1',
                habitId: '1',
                occurrenceDate: '2026-10-01',
                completedAt: now,
            },
            {
                id: 'c2',
                habitId: '1',
                occurrenceDate: '2026-10-02',
                completedAt: now,
            },
        ]
        render(
            <HabitMonthProgress
                habit={habit}
                completions={completions}
                today={today}
            />,
        )

        expect(screen.getByText('Выполнено 2 из 12')).toBeTruthy()
    })

    it('navigates to the previous month, and back forward to the current one', () => {
        render(
            <HabitMonthProgress habit={habit} completions={[]} today={today} />,
        )

        fireEvent.press(
            screen.getByRole('button', { name: 'Предыдущий месяц' }),
        )
        expect(
            screen.getByText(formatMonthLabel(new Date(2026, 8, 1))),
        ).toBeTruthy()

        fireEvent.press(screen.getByRole('button', { name: 'Следующий месяц' }))
        expect(
            screen.getByText(formatMonthLabel(new Date(2026, 9, 1))),
        ).toBeTruthy()
        expect(
            screen.getByRole('button', { name: 'Следующий месяц' }).props
                .accessibilityState?.disabled,
        ).toBe(true)
    })
})
