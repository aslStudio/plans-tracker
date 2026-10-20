import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { CalendarTimeModal } from './CalendarTimeModal'

describe('CalendarTimeModal', () => {
    it('shows the given start time and duration', () => {
        render(
            <CalendarTimeModal
                visible
                startMinute={9 * 60}
                duration={60}
                onClose={() => {}}
                onSave={() => {}}
            />,
        )

        expect(screen.getByLabelText('Начало · часы 09')).toBeTruthy()
        expect(screen.getByLabelText('Начало · минуты 00')).toBeTruthy()
    })

    it('calls onSave with the selected start and duration, and closes', () => {
        const onSave = jest.fn()
        const onClose = jest.fn()
        render(
            <CalendarTimeModal
                visible
                startMinute={9 * 60}
                duration={60}
                onClose={onClose}
                onSave={onSave}
            />,
        )

        fireEvent.press(screen.getByText('Готово'))

        expect(onSave).toHaveBeenCalledWith(9 * 60, 60)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when cancelled', () => {
        const onClose = jest.fn()
        render(
            <CalendarTimeModal
                visible
                startMinute={9 * 60}
                duration={60}
                onClose={onClose}
                onSave={() => {}}
            />,
        )

        fireEvent.press(screen.getByText('Отмена'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
