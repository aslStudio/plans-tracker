import { Text } from 'react-native'

import { fireEvent, render } from '@/shared/lib/test-utils'

import { Row } from './Row'

describe('Row', () => {
    it('renders label and description', () => {
        const { getByText } = render(
            <Row label="Notifications" description="Push alerts" />,
        )

        expect(getByText('Notifications')).toBeTruthy()
        expect(getByText('Push alerts')).toBeTruthy()
    })

    it('renders the right element', () => {
        const { getByText } = render(
            <Row label="Appearance" RightElement={<Text>System</Text>} />,
        )

        expect(getByText('System')).toBeTruthy()
    })

    it('calls onPress when tapped', () => {
        const onPress = jest.fn()
        const { getByTestId } = render(
            <Row label="Notifications" onPress={onPress} testID="row" />,
        )

        fireEvent.press(getByTestId('row'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('does not call onPress when disabled', () => {
        const onPress = jest.fn()
        const { getByTestId } = render(
            <Row
                label="Notifications"
                onPress={onPress}
                disabled
                testID="row"
            />,
        )

        fireEvent.press(getByTestId('row'))

        expect(onPress).not.toHaveBeenCalled()
    })

    it('renders as a non-pressable view without onPress', () => {
        const { getByTestId } = render(
            <Row label="Friend Updates" testID="row" />,
        )

        expect(getByTestId('row').props.onPress).toBeUndefined()
    })
})
