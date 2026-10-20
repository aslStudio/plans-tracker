import { lottie } from '@/shared/config/lottie'
import { render } from '@/shared/lib/test-utils'

import { TheLottie } from './TheLottie'

describe('TheLottie', () => {
    it('renders a placeholder view while the animation loads', () => {
        const { toJSON } = render(
            <TheLottie
                source={lottie.streak}
                accessibilityLabel="Анимация серии"
                style={{ width: 40, height: 40 }}
            />,
        )

        expect(toJSON()).toBeTruthy()
    })
})
