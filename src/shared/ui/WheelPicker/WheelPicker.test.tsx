import { fireEvent } from '@testing-library/react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { WheelPicker } from './WheelPicker'

const column = {
    options: [{ label: '01', value: '01' }],
    value: '01',
    onChange: () => {},
}

describe('WheelPicker', () => {
    it('shows the title', () => {
        render(
            <WheelPicker
                isOpen
                title="Дата начала"
                columns={[column]}
                setIsOpen={() => {}}
                onSubmit={() => {}}
            />,
        )

        expect(screen.getByText('Дата начала')).toBeTruthy()
    })

    it('shows only a full-width "Применить" when no onReset is given', () => {
        render(
            <WheelPicker
                isOpen
                columns={[column]}
                setIsOpen={() => {}}
                onSubmit={() => {}}
            />,
        )

        expect(screen.getByText('Применить')).toBeTruthy()
        expect(screen.queryByText('Сбросить')).toBeNull()
    })

    it('shows "Сбросить" alongside "Применить" when onReset is given', () => {
        render(
            <WheelPicker
                isOpen
                columns={[column]}
                setIsOpen={() => {}}
                onSubmit={() => {}}
                onReset={() => {}}
            />,
        )

        expect(screen.getByText('Сбросить')).toBeTruthy()
        expect(screen.getByText('Применить')).toBeTruthy()
    })

    it('calls onSubmit when "Применить" is pressed', () => {
        const onSubmit = jest.fn()
        render(
            <WheelPicker
                isOpen
                columns={[column]}
                setIsOpen={() => {}}
                onSubmit={onSubmit}
            />,
        )

        fireEvent.press(screen.getByText('Применить'))

        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('calls onReset when "Сбросить" is pressed', () => {
        const onReset = jest.fn()
        render(
            <WheelPicker
                isOpen
                columns={[column]}
                setIsOpen={() => {}}
                onSubmit={() => {}}
                onReset={onReset}
            />,
        )

        fireEvent.press(screen.getByText('Сбросить'))

        expect(onReset).toHaveBeenCalledTimes(1)
    })
})
