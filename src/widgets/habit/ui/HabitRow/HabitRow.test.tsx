import type { Habit } from '@/shared/api'
import type { WeekStripDay } from '@/entities/habit'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { HabitRow } from './HabitRow'

const habit: Habit = {
    id: 'h1',
    title: 'Тренировка',
    repeat: { type: 'daily' },
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
}

const weekStrip: WeekStripDay[] = []

describe('HabitRow', () => {
    it('renders the habit title and category', () => {
        render(
            <HabitRow
                habit={habit}
                category={{ id: 'sport', label: 'Спорт', order: 0 }}
                isCompleted={false}
                isDue
                completionActionLabel="Отметить выполненной"
                weekStrip={weekStrip}
                onToggle={() => {}}
                onPress={() => {}}
            />,
        )

        expect(screen.getByText('Тренировка')).toBeTruthy()
        expect(screen.getByText('Спорт')).toBeTruthy()
    })

    it('calls onToggle when the radio is pressed and the habit is due', () => {
        const onToggle = jest.fn()
        render(
            <HabitRow
                habit={habit}
                isCompleted={false}
                isDue
                completionActionLabel="Отметить выполненной"
                weekStrip={weekStrip}
                onToggle={onToggle}
                onPress={() => {}}
            />,
        )

        fireEvent.press(screen.getByLabelText('Отметить выполненной'))

        expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('disables the radio when the habit is not due', () => {
        const onToggle = jest.fn()
        render(
            <HabitRow
                habit={habit}
                isCompleted={false}
                isDue={false}
                completionActionLabel="Отметить выполненной"
                weekStrip={weekStrip}
                onToggle={onToggle}
                onPress={() => {}}
            />,
        )

        fireEvent.press(screen.getByLabelText('Отметить выполненной'))

        expect(onToggle).not.toHaveBeenCalled()
    })

    it('calls onPress when the content area is pressed', () => {
        const onPress = jest.fn()
        render(
            <HabitRow
                habit={habit}
                isCompleted={false}
                isDue
                completionActionLabel="Отметить выполненной"
                weekStrip={weekStrip}
                onToggle={() => {}}
                onPress={onPress}
            />,
        )

        fireEvent.press(screen.getByText('Тренировка'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })
})
