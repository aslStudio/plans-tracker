import { fireEvent } from '@testing-library/react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { DateWheelRow } from './DateWheelRow'

describe('DateWheelRow', () => {
    it('shows "Не задана" when there is no value', () => {
        render(
            <DateWheelRow
                label="Дата начала"
                value={null}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Не задана')).toBeTruthy()
    })

    it('shows the formatted date when a value is set', () => {
        render(
            <DateWheelRow
                label="Дата начала"
                value="2026-10-12"
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('12 окт')).toBeTruthy()
    })

    it('calls onChange(null) when "Сбросить" is pressed', () => {
        const onChange = jest.fn()
        render(
            <DateWheelRow
                label="Дата начала"
                value="2026-10-12"
                onChange={onChange}
            />,
        )

        fireEvent.press(screen.getByText('Дата начала'))
        fireEvent.press(screen.getByText('Сбросить'))

        expect(onChange).toHaveBeenCalledWith(null)
    })

    it('calls onChange with the joined draft date when "Применить" is pressed', () => {
        const onChange = jest.fn()
        render(
            <DateWheelRow
                label="Дата начала"
                value="2026-10-12"
                onChange={onChange}
            />,
        )

        fireEvent.press(screen.getByText('Дата начала'))
        fireEvent.press(screen.getByText('Применить'))

        expect(onChange).toHaveBeenCalledWith('2026-10-12')
    })
})
