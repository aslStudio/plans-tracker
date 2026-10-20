import { lottie } from '@/shared/config/lottie'
import { render, screen } from '@/shared/lib/test-utils'

import { OnboardingFeatureItem } from './OnboardingFeatureItem'

describe('OnboardingFeatureItem', () => {
    it('renders the title and description', () => {
        render(
            <OnboardingFeatureItem
                title="Удобный трекинг"
                description="Статусы, приоритеты и группы — всё под рукой"
                animation={lottie.plus}
            />,
        )

        expect(screen.getByText('Удобный трекинг')).toBeTruthy()
        expect(
            screen.getByText('Статусы, приоритеты и группы — всё под рукой'),
        ).toBeTruthy()
    })
})
