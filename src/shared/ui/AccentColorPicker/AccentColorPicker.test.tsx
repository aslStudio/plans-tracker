import { fireEvent } from '@testing-library/react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { AccentColorPicker } from './AccentColorPicker'

describe('AccentColorPicker', () => {
    it('calls onChange with the accent name when a swatch is pressed', () => {
        const onChange = jest.fn()
        render(<AccentColorPicker value={null} onChange={onChange} />)

        fireEvent.press(screen.getByLabelText('accent-red'))

        expect(onChange).toHaveBeenCalledWith('accent-red')
    })

    it('does not render a "no color" swatch unless allowNoColor is set', () => {
        render(<AccentColorPicker value={null} onChange={() => {}} />)

        expect(screen.queryByLabelText('Без цвета')).toBeNull()
    })

    it('renders a "no color" swatch when allowNoColor is set, calling onChange(null) when pressed', () => {
        const onChange = jest.fn()
        render(
            <AccentColorPicker
                value="accent-red"
                allowNoColor
                onChange={onChange}
            />,
        )

        fireEvent.press(screen.getByLabelText('Без цвета'))

        expect(onChange).toHaveBeenCalledWith(null)
    })
})
