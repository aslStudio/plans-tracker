import { router } from 'expo-router'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'
import { SectionIntro } from './SectionIntro'

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))
afterEach(() => jest.clearAllMocks())

it.each([
    ['Настроить группы', 'groups'],
    ['Настроить приоритеты', 'priority'],
    ['Настроить обзор дней', 'days'],
])('opens the exact setting from %s', (label, target) => {
    render(<SectionIntro section="tasks" onCreate={() => {}} />)
    fireEvent.press(screen.getByText(label))
    expect(router.push).toHaveBeenCalledWith({
        pathname: '/settings',
        params: { highlight: target },
    })
})

it('opens habit categories and creates a habit from its introduction', () => {
    const onCreate = jest.fn()
    render(<SectionIntro section="habits" onCreate={onCreate} />)
    fireEvent.press(screen.getByText('Настроить категории'))
    expect(router.push).toHaveBeenCalledWith({
        pathname: '/settings',
        params: { highlight: 'categories' },
    })
    fireEvent.press(screen.getByText('Начать'))
    expect(onCreate).toHaveBeenCalledTimes(1)
})

it.each(['tasks', 'habits'] as const)(
    'opens the matching widget gallery for %s',
    (section) => {
        render(<SectionIntro section={section} onCreate={() => {}} />)
        fireEvent.press(screen.getByText('Выбрать виджет'))
        expect(router.push).toHaveBeenCalledWith({
            pathname: '/widget-guide',
            params: { section },
        })
    },
)
