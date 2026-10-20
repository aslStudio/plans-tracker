import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { OverdueTasksReminder } from './OverdueTasksReminder'

describe('OverdueTasksReminder', () => {
    it('renders the warning message when visible', () => {
        render(<OverdueTasksReminder visible onClose={() => {}} />)

        expect(screen.getByText('Есть просроченные задачи')).toBeTruthy()
    })

    it('calls onClose when the confirm button is pressed', () => {
        const onClose = jest.fn()
        render(<OverdueTasksReminder visible onClose={onClose} />)

        fireEvent.press(screen.getByText('Понятно'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
