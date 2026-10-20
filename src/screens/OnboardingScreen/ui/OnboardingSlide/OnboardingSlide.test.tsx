import { render, screen } from '@/shared/lib/test-utils'

import { ONBOARDING_SLIDES } from '../../data'
import { OnboardingSlide } from './OnboardingSlide'

describe('OnboardingSlide', () => {
    it('renders the title, description and every feature', () => {
        const slide = ONBOARDING_SLIDES[0]
        render(<OnboardingSlide slide={slide} width={360} />)

        expect(screen.getByText(slide.title)).toBeTruthy()
        expect(screen.getByText(slide.description)).toBeTruthy()
        for (const feature of slide.features) {
            expect(screen.getByText(feature.title)).toBeTruthy()
        }
    })
})
