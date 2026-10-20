import { Text } from 'react-native'

import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { ButtonBaseWrapper } from './ButtonBaseWrapper'

describe('ButtonBaseWrapper', () => {
    it('calls onPress and exposes button semantics', () => {
        const onPress = jest.fn()
        render(
            <ButtonBaseWrapper height={44} onPress={onPress}>
                <Text>Action</Text>
            </ButtonBaseWrapper>,
        )

        fireEvent.press(screen.getByRole('button', { name: 'Action' }))
        expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('keeps plain button colors and only reduces opacity when disabled', () => {
        const onPress = jest.fn()
        render(
            <ButtonBaseWrapper
                height={36}
                variant="plain"
                isDisabled
                disabledAppearance="opacity"
                onPress={onPress}
            >
                {(state) => <Text>{state.backgroundColor}</Text>}
            </ButtonBaseWrapper>,
        )
        const button = screen.getByRole('button')
        expect(button).toHaveStyle({ opacity: 0.35 })
        expect(screen.getByText('transparent')).toBeTruthy()
        fireEvent.press(button)
        expect(onPress).not.toHaveBeenCalled()
    })

    it.each([
        ['disabled', { isDisabled: true }],
        ['loading', { isLoading: true }],
    ] as const)('blocks presses while %s', (_, blockedProps) => {
        const onPress = jest.fn()
        render(
            <ButtonBaseWrapper height={44} onPress={onPress} {...blockedProps}>
                <Text>Action</Text>
            </ButtonBaseWrapper>,
        )

        const button = screen.getByRole('button', { name: 'Action' })
        fireEvent.press(button)

        expect(onPress).not.toHaveBeenCalled()
        expect(button.props.accessibilityState).toMatchObject({
            disabled: true,
        })
    })
})
