import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { TheButtonIcon } from './TheButtonIcon'

describe('TheButtonIcon', () => {
    it('calls onPress when pressed', () => {
        const onPress = jest.fn()
        render(<TheButtonIcon icon="plus" onPress={onPress} />)

        fireEvent.press(screen.getByRole('button'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('does not call onPress when disabled', () => {
        const onPress = jest.fn()
        render(<TheButtonIcon icon="plus" onPress={onPress} isDisabled />)

        fireEvent.press(screen.getByRole('button'))

        expect(onPress).not.toHaveBeenCalled()
    })

    it('does not call onPress while loading', () => {
        const onPress = jest.fn()
        render(<TheButtonIcon icon="plus" onPress={onPress} isLoading />)

        fireEvent.press(screen.getByRole('button'))

        expect(onPress).not.toHaveBeenCalled()
    })

    it.each(['primary', 'secondary', 'plain'] as const)(
        'matches the snapshot for variant="%s"',
        (variant) => {
            const { toJSON } = render(
                <TheButtonIcon
                    icon="plus"
                    onPress={jest.fn()}
                    variant={variant}
                />,
            )
            expect(toJSON()).toMatchSnapshot()
        },
    )

    it.each(['52', '44', '40', '36', '28', '22'] as const)(
        'matches the snapshot for size="%s"',
        (size) => {
            const { toJSON } = render(
                <TheButtonIcon icon="plus" onPress={jest.fn()} size={size} />,
            )
            expect(toJSON()).toMatchSnapshot()
        },
    )

    it('matches the snapshot while loading', () => {
        const { toJSON } = render(
            <TheButtonIcon icon="plus" onPress={jest.fn()} isLoading />,
        )
        expect(toJSON()).toMatchSnapshot()
    })
})
