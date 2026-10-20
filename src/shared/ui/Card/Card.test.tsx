import { Text } from 'react-native'

import { render } from '@/shared/lib/test-utils'

import { Card } from './Card'

describe('Card', () => {
    it('renders its children', () => {
        const { getByText } = render(
            <Card>
                <Text>Содержимое</Text>
            </Card>,
        )

        expect(getByText('Содержимое')).toBeTruthy()
    })
})
