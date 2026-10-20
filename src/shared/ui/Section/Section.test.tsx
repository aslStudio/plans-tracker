import { Text } from 'react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { Section } from './Section'

describe('Section', () => {
    it('renders all supplied cells', () => {
        render(
            <Section>
                <Text>First cell</Text>
                <Text>Second cell</Text>
            </Section>,
        )

        expect(screen.getByText('First cell')).toBeTruthy()
        expect(screen.getByText('Second cell')).toBeTruthy()
    })

    it('renders TopElement and BottomElement around the card', () => {
        render(
            <Section
                TopElement={<Text>Above the card</Text>}
                BottomElement={<Text>Below the card</Text>}
            >
                <Text>Card content</Text>
            </Section>,
        )

        expect(screen.getByText('Above the card')).toBeTruthy()
        expect(screen.getByText('Card content')).toBeTruthy()
        expect(screen.getByText('Below the card')).toBeTruthy()
    })
})
