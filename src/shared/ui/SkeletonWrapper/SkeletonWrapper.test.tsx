import { Text } from 'react-native'

import { render } from '@/shared/lib/test-utils'

import { SkeletonWrapper } from './SkeletonWrapper'

describe('SkeletonWrapper', () => {
    it('shows the skeleton while loading', () => {
        const { getByText, queryByText } = render(
            <SkeletonWrapper isLoading skeleton={<Text>Скелетон</Text>}>
                <Text>Реальный контент</Text>
            </SkeletonWrapper>,
        )

        expect(getByText('Скелетон')).toBeTruthy()
        expect(queryByText('Реальный контент')).toBeNull()
    })

    it('shows the real content once loading finishes', () => {
        const { getByText, queryByText } = render(
            <SkeletonWrapper isLoading={false} skeleton={<Text>Скелетон</Text>}>
                <Text>Реальный контент</Text>
            </SkeletonWrapper>,
        )

        expect(getByText('Реальный контент')).toBeTruthy()
        expect(queryByText('Скелетон')).toBeNull()
    })
})
