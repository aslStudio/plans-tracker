import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { HabitCompletionCelebration } from './HabitCompletionCelebration'

describe('HabitCompletionCelebration', () => {
    it('renders the streak message when visible', () => {
        render(
            <HabitCompletionCelebration
                visible
                previousStreak={4}
                streak={5}
                onClose={() => {}}
            />,
        )

        expect(screen.getByText('Все привычки выполнены!')).toBeTruthy()
        expect(screen.getByLabelText('Текущая серия привычек')).toBeTruthy()
    })

    it('calls onClose when the confirm button is pressed', () => {
        const onClose = jest.fn()
        render(
            <HabitCompletionCelebration
                visible
                previousStreak={4}
                streak={5}
                onClose={onClose}
            />,
        )

        fireEvent.press(screen.getByText('Отлично!'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
