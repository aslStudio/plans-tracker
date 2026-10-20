import { render } from '@/shared/lib/test-utils'

import { ScreenGradientBackground } from './ScreenGradientBackground'

describe('ScreenGradientBackground', () => {
    it('renders without crashing', () => {
        const { toJSON } = render(<ScreenGradientBackground />)

        expect(toJSON()).toBeTruthy()
    })
})
