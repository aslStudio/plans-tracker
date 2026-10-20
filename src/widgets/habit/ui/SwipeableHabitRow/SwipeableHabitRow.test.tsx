import { Text } from 'react-native'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { SwipeableHabitRow } from './SwipeableHabitRow'

describe('SwipeableHabitRow', () => {
    it('renders its children', () => {
        render(
            <SwipeableHabitRow habitId="h1" onDelete={() => {}}>
                <Text>Тренировка</Text>
            </SwipeableHabitRow>,
        )

        expect(screen.getByText('Тренировка')).toBeTruthy()
    })

    it('asks for confirmation and calls onDelete once confirmed', () => {
        const onDelete = jest.fn()
        render(
            <SwipeableHabitRow habitId="h1" onDelete={onDelete}>
                <Text>Тренировка</Text>
            </SwipeableHabitRow>,
        )

        fireEvent.press(screen.getByLabelText('Удалить привычку'))
        expect(onDelete).not.toHaveBeenCalled()

        const confirmButton = screen.getAllByText('Удалить').at(-1)
        fireEvent.press(confirmButton!)

        expect(onDelete).toHaveBeenCalledTimes(1)
    })
})
