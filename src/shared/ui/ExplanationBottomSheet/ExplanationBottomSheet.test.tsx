import { lottie } from '@/shared/config/lottie'
import { fireEvent, render } from '@/shared/lib/test-utils'

import { ExplanationBottomSheet } from './ExplanationBottomSheet'

describe('ExplanationBottomSheet', () => {
    it('renders the title and description while visible', () => {
        const { getByText } = render(
            <ExplanationBottomSheet
                visible
                title="Повторяющиеся задачи"
                description="Поясняющий текст"
                animation={lottie.warning}
                onClose={() => {}}
            />,
        )

        expect(getByText('Повторяющиеся задачи')).toBeTruthy()
        expect(getByText('Поясняющий текст')).toBeTruthy()
    })

    it('calls onClose when dismissed', () => {
        const onClose = jest.fn()
        const { getByText } = render(
            <ExplanationBottomSheet
                visible
                title="Заголовок"
                description="Описание"
                animation={lottie.warning}
                onClose={onClose}
            />,
        )

        fireEvent.press(getByText('Понятно'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
