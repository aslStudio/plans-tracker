import { ScrollView } from 'react-native'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { ONBOARDING_SLIDES } from './data'
import { OnboardingScreen } from './OnboardingScreen'

function scrollTo(x: number) {
    fireEvent(screen.UNSAFE_getByType(ScrollView), 'momentumScrollEnd', {
        nativeEvent: { contentOffset: { x } },
    })
}

describe('OnboardingScreen', () => {
    it('shows the first slide and a skip button', () => {
        render(<OnboardingScreen onFinish={() => {}} />)

        expect(screen.getByText(ONBOARDING_SLIDES[0].title)).toBeTruthy()
        expect(screen.getByLabelText('Пропустить')).toBeTruthy()
        expect(screen.getByText('Далее')).toBeTruthy()
    })

    it('calls onFinish when skip is pressed', () => {
        const onFinish = jest.fn()
        render(<OnboardingScreen onFinish={onFinish} />)

        fireEvent.press(screen.getByLabelText('Пропустить'))

        expect(onFinish).toHaveBeenCalledTimes(1)
    })

    it('shows a "Начать" button and hides skip on the last slide', () => {
        render(<OnboardingScreen onFinish={() => {}} />)

        scrollTo(999999)

        expect(screen.getByText('Начать')).toBeTruthy()
        expect(screen.queryByLabelText('Пропустить')).toBeNull()
        expect(
            screen.getByText(
                ONBOARDING_SLIDES[ONBOARDING_SLIDES.length - 1].title,
            ),
        ).toBeTruthy()
    })

    it('calls onFinish when "Начать" is pressed on the last slide', () => {
        const onFinish = jest.fn()
        render(<OnboardingScreen onFinish={onFinish} />)

        scrollTo(999999)
        fireEvent.press(screen.getByText('Начать'))

        expect(onFinish).toHaveBeenCalledTimes(1)
    })
})
