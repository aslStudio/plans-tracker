import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { TasksCompletionCelebration } from './TasksCompletionCelebration'

describe('TasksCompletionCelebration', () => {
    it('renders the completion message when visible', () => {
        render(<TasksCompletionCelebration visible onClose={() => {}} />)

        expect(screen.getByText('Все задачи выполнены!')).toBeTruthy()
        expect(screen.getByLabelText('Все задачи выполнены')).toBeTruthy()
    })

    it('calls onClose when the confirm button is pressed', () => {
        const onClose = jest.fn()
        render(<TasksCompletionCelebration visible onClose={onClose} />)

        fireEvent.press(screen.getByText('Отлично!'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
