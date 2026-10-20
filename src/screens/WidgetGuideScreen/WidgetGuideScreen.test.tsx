import { fireEvent, render, screen } from '@/shared/lib/test-utils'
import { WidgetGuideScreen } from './WidgetGuideScreen'

let mockSection = 'tasks'
const mockReplace = jest.fn()
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ section: mockSection }),
    useRouter: () => ({ canGoBack: () => false, replace: mockReplace }),
}))

it.each(['tasks', 'habits'])(
    'shows three sizes and installation instructions for %s',
    (section) => {
        mockSection = section
        render(<WidgetGuideScreen />)
        expect(screen.getByText('Как добавить на iPhone')).toBeTruthy()
        fireEvent.press(screen.getByRole('button', { name: 'Большой виджет' }))
        expect(
            screen.getByRole('button', { name: 'Большой виджет' }).props
                .accessibilityState.selected,
        ).toBe(true)
        expect(
            screen.getByRole('button', { name: 'Маленький виджет' }).props
                .accessibilityState.selected,
        ).toBe(false)
        expect(
            screen.getAllByText(
                section === 'tasks' ? 'Задачи · сегодня' : '5 дней подряд',
            ).length,
        ).toBeTruthy()
        fireEvent.press(screen.getByRole('button', { name: 'Закрыть' }))
        expect(mockReplace).toHaveBeenCalledWith('/')
    },
)
