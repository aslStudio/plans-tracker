import { fireEvent, render } from '@/shared/lib/test-utils'

import { AnimatedColorSwatch } from './AnimatedColorSwatch'

describe('AnimatedColorSwatch', () => {
    it('renders with an accessible label', () => {
        const { getByLabelText } = render(
            <AnimatedColorSwatch
                color="#548CBF"
                selected={false}
                accessibilityLabel="Синий"
                onPress={() => {}}
            />,
        )

        expect(getByLabelText('Синий')).toBeTruthy()
    })

    it('calls onPress when tapped', () => {
        const onPress = jest.fn()
        const { getByLabelText } = render(
            <AnimatedColorSwatch
                color="#548CBF"
                selected={false}
                accessibilityLabel="Синий"
                onPress={onPress}
            />,
        )

        fireEvent.press(getByLabelText('Синий'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('reflects the selected accessibility state', () => {
        const { getByLabelText } = render(
            <AnimatedColorSwatch
                color="#548CBF"
                selected
                accessibilityLabel="Синий"
                onPress={() => {}}
            />,
        )

        expect(getByLabelText('Синий').props.accessibilityState).toEqual(
            expect.objectContaining({ selected: true }),
        )
    })
})
