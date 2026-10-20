import { Text } from 'react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
    it('renders LeftItem, CenterItem, and RightItem', () => {
        render(
            <AppHeader
                LeftItem={<Text>Left</Text>}
                CenterItem={<Text>Center</Text>}
                RightItem={<Text>Right</Text>}
            />,
        )

        expect(screen.getByText('Left')).toBeTruthy()
        expect(screen.getByText('Center')).toBeTruthy()
        expect(screen.getByText('Right')).toBeTruthy()
    })
})
