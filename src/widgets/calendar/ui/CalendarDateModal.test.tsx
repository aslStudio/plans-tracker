import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { CalendarDateModal } from './CalendarDateModal'

describe('CalendarDateModal', () => {
    it('shows the month containing the given value', () => {
        render(
            <CalendarDateModal
                visible
                value="2026-10-14"
                onClose={() => {}}
                onSave={() => {}}
            />,
        )

        expect(screen.getByText('Октябрь 2026')).toBeTruthy()
    })

    it('calls onSave with the selected date and closes', () => {
        const onSave = jest.fn()
        const onClose = jest.fn()
        render(
            <CalendarDateModal
                visible
                value="2026-10-14"
                onClose={onClose}
                onSave={onSave}
            />,
        )

        fireEvent.press(screen.getByLabelText('2026-10-20'))
        fireEvent.press(screen.getByText('Готово'))

        expect(onSave).toHaveBeenCalledWith('2026-10-20')
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the backdrop is pressed', () => {
        const onClose = jest.fn()
        render(
            <CalendarDateModal
                visible
                value="2026-10-14"
                onClose={onClose}
                onSave={() => {}}
            />,
        )

        fireEvent.press(screen.getByLabelText('Закрыть окно'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
