import { Text } from 'react-native'

import { render } from '@/shared/lib/test-utils'

import { TransitionFade } from './TransitionFade'

describe('TransitionFade', () => {
    it('renders the skeleton while loading', () => {
        const { getByText, queryByText } = render(
            <TransitionFade loading skeleton={<Text>Скелетон</Text>}>
                <Text>Контент</Text>
            </TransitionFade>,
        )

        expect(getByText('Скелетон')).toBeTruthy()
        expect(queryByText('Контент')).toBeNull()
    })

    it('renders the children once not loading', () => {
        const { getByText, queryByText } = render(
            <TransitionFade loading={false} skeleton={<Text>Скелетон</Text>}>
                <Text>Контент</Text>
            </TransitionFade>,
        )

        expect(getByText('Контент')).toBeTruthy()
        expect(queryByText('Скелетон')).toBeNull()
    })
})
