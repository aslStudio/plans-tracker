import { fireEvent } from '@testing-library/react-native'

import { render } from '@/shared/lib/test-utils'

import { Toggle } from './Toggle'

describe('Toggle', () => {
    it('renders the off state', () => {
        const { toJSON } = render(<Toggle value={false} onChange={() => {}} />)
        expect(toJSON()).toMatchSnapshot()
    })

    it('renders the on state', () => {
        const { toJSON } = render(<Toggle value={true} onChange={() => {}} />)
        expect(toJSON()).toMatchSnapshot()
    })

    it('calls onChange with the new value when toggled', () => {
        const onChange = jest.fn()
        const { getByTestId } = render(
            <Toggle value={false} onChange={onChange} testID="toggle" />,
        )

        fireEvent(getByTestId('toggle'), 'valueChange', true)

        expect(onChange).toHaveBeenCalledWith(true)
    })

    it('does not respond when disabled', () => {
        const { getByTestId } = render(
            <Toggle
                value={false}
                onChange={() => {}}
                disabled
                testID="toggle"
            />,
        )

        expect(getByTestId('toggle').props.disabled).toBe(true)
    })
})
