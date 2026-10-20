import { Text } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { render, screen } from '@/shared/lib/test-utils'

import { CalendarPage, type CalendarMotion } from './CalendarMotion'

function Wrapper() {
    const motion = useSharedValue<CalendarMotion>({
        kind: 'slide',
        direction: 1,
        x: 0,
        y: 0,
    })
    return (
        <CalendarPage motion={motion} onSwipe={() => {}} gestureId="test">
            <Text>Содержимое страницы</Text>
        </CalendarPage>
    )
}

describe('CalendarPage', () => {
    it('renders its children', () => {
        render(<Wrapper />)

        expect(screen.getByText('Содержимое страницы')).toBeTruthy()
    })
})
