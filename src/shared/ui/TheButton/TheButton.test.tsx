import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { TheButton } from './TheButton'

describe('TheButton', () => {
    it('renders its label', () => {
        render(<TheButton onPress={jest.fn()}>Продолжить</TheButton>)
        expect(screen.getByText('Продолжить')).toBeTruthy()
    })

    it('calls onPress when pressed', () => {
        const onPress = jest.fn()
        render(<TheButton onPress={onPress}>Продолжить</TheButton>)

        fireEvent.press(screen.getByRole('button'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('does not call onPress when disabled', () => {
        const onPress = jest.fn()
        render(
            <TheButton onPress={onPress} isDisabled>
                Продолжить
            </TheButton>,
        )

        fireEvent.press(screen.getByRole('button'))

        expect(onPress).not.toHaveBeenCalled()
    })

    it('does not call onPress while loading', () => {
        const onPress = jest.fn()
        render(
            <TheButton onPress={onPress} isLoading>
                Продолжить
            </TheButton>,
        )

        fireEvent.press(screen.getByRole('button'))

        expect(onPress).not.toHaveBeenCalled()
    })

    it('exposes disabled/busy accessibility state', () => {
        render(
            <TheButton onPress={jest.fn()} isDisabled>
                Продолжить
            </TheButton>,
        )
        expect(
            screen.getByRole('button').props.accessibilityState,
        ).toMatchObject({
            disabled: true,
        })
    })

    it('keeps a prominent save button full width', () => {
        render(
            <TheButton onPress={jest.fn()} isWide>
                Сохранить
            </TheButton>,
        )

        expect(screen.getByRole('button')).toHaveStyle({
            width: '100%',
            borderWidth: 1,
        })
    })

    it('lets a prominent button fill its share of a footer', () => {
        render(
            <TheButton onPress={jest.fn()} isFlex>
                Сохранить
            </TheButton>,
        )

        expect(screen.getByRole('button')).toHaveStyle({
            flex: 1,
            borderWidth: 1,
        })
    })

    it.each(['primary', 'secondary', 'plain'] as const)(
        'matches the snapshot for variant="%s"',
        (variant) => {
            const { toJSON } = render(
                <TheButton onPress={jest.fn()} variant={variant}>
                    Продолжить
                </TheButton>,
            )
            expect(toJSON()).toMatchSnapshot()
        },
    )

    it.each(['brand', 'destructive', 'neutral', 'overlay', 'grouped'] as const)(
        'matches the snapshot for view="%s"',
        (view) => {
            const { toJSON } = render(
                <TheButton onPress={jest.fn()} view={view}>
                    Продолжить
                </TheButton>,
            )
            expect(toJSON()).toMatchSnapshot()
        },
    )

    it('matches the snapshot with icons', () => {
        const { toJSON } = render(
            <TheButton
                onPress={jest.fn()}
                iconLeft="search-outline"
                iconRight="plus"
            >
                Продолжить
            </TheButton>,
        )
        expect(toJSON()).toMatchSnapshot()
    })

    it('matches the snapshot while loading', () => {
        const { toJSON } = render(
            <TheButton onPress={jest.fn()} isLoading>
                Продолжить
            </TheButton>,
        )
        expect(toJSON()).toMatchSnapshot()
    })
})
