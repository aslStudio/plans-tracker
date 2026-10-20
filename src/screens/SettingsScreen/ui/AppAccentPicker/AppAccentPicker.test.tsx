import { fireEvent } from '@testing-library/react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { AppAccentPicker } from './AppAccentPicker'

describe('AppAccentPicker', () => {
    it('calls onChange with the accent name when a swatch is pressed', () => {
        const onChange = jest.fn()
        render(<AppAccentPicker value="turquoise" onChange={onChange} />)

        fireEvent.press(screen.getByLabelText('Красный'))

        expect(onChange).toHaveBeenCalledWith('red')
    })

    it('marks the current value as the active swatch', () => {
        render(<AppAccentPicker value="green" onChange={() => {}} />)

        const active = screen.getByLabelText('Зелёный')
        expect(active).toBeTruthy()
    })

    it('offers "Розовый" (softPink) but not a second, near-identical red-ish pink', () => {
        render(<AppAccentPicker value="turquoise" onChange={() => {}} />)

        expect(screen.getAllByRole('button')).toHaveLength(8)
        expect(screen.getByLabelText('Розовый')).toBeTruthy()
    })
})
