import { fireEvent } from '@testing-library/react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { SettingsScreen } from './SettingsScreen'

const GROUPS = [
    {
        id: 'group-work',
        label: 'Работа',
        color: 'accent-blue' as const,
        order: 0,
    },
]
const PRIORITIES = [
    {
        id: 'priority-high',
        label: 'Высокий',
        color: 'accent-red' as const,
        order: 0,
        isBuiltIn: true,
    },
]
const HABIT_CATEGORIES = [
    {
        id: 'health',
        label: 'Здоровье',
        color: 'accent-green' as const,
        order: 0,
    },
]

const noop = () => {}

function renderScreen(
    overrides: Partial<Parameters<typeof SettingsScreen>[0]> = {},
) {
    return render(
        <SettingsScreen
            useGroups
            usePriority
            groups={GROUPS}
            priorities={PRIORITIES}
            useHabitCategories={false}
            habitCategories={[]}
            accentName="turquoise"
            themeMode="system"
            onChangeThemeMode={noop}
            onClose={noop}
            onToggleGroups={noop}
            onTogglePriority={noop}
            onCreateGroup={noop}
            onUpdateGroup={noop}
            onDeleteGroup={noop}
            onCreatePriority={noop}
            onUpdatePriority={noop}
            onDeletePriority={noop}
            onToggleHabitCategories={noop}
            onCreateHabitCategory={noop}
            onUpdateHabitCategory={noop}
            onDeleteHabitCategory={noop}
            onChangeAccent={noop}
            {...overrides}
        />,
    )
}

describe('SettingsScreen', () => {
    it('changes the number of future days shown in the task list', () => {
        const onChangeTaskDaysAhead = jest.fn()
        renderScreen({ taskDaysAhead: 1, onChangeTaskDaysAhead })

        fireEvent.press(
            screen.getByRole('button', { name: 'На один день больше' }),
        )

        expect(onChangeTaskDaysAhead).toHaveBeenCalledWith(2)
    })

    it('removes global recurrence and calendar time controls', () => {
        renderScreen()
        expect(screen.queryByText('Повторение задач')).toBeNull()
        expect(screen.queryByText('Время задач в календаре')).toBeNull()
    })

    it('shows an explanation when the future-days label is pressed', () => {
        renderScreen({ onChangeTaskDaysAhead: noop })

        fireEvent.press(
            screen.getByRole('button', { name: 'Показывать дней вперёд' }),
        )

        expect(screen.getByText('Планируйте заранее')).toBeTruthy()
        expect(screen.getByText(/ближайших дней показывать/)).toBeTruthy()
        expect(screen.getByText('Понятно')).toBeTruthy()
    })

    it('calls onClose when the close button is pressed', () => {
        const onClose = jest.fn()
        renderScreen({ onClose })

        fireEvent.press(screen.getByRole('button', { name: 'Закрыть' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('exposes download and clear log actions at the bottom of settings', () => {
        const onDownloadLogs = jest.fn()
        const onClearLogs = jest.fn()
        renderScreen({ onDownloadLogs, onClearLogs })

        fireEvent.press(screen.getByText('Скачать логи'))
        fireEvent.press(screen.getByText('Очистить логи'))
        expect(onClearLogs).not.toHaveBeenCalled()
        fireEvent.press(screen.getByText('Удалить'))

        expect(onDownloadLogs).toHaveBeenCalledTimes(1)
        expect(onClearLogs).toHaveBeenCalledTimes(1)
    })

    it('calls onToggleGroups when the Группы switch is flipped', () => {
        const onToggleGroups = jest.fn()
        renderScreen({ onToggleGroups })

        fireEvent(screen.getAllByRole('switch')[0], 'onValueChange', false)

        expect(onToggleGroups).toHaveBeenCalledWith(false)
    })

    it('hides the group list when useGroups is off', () => {
        renderScreen({ useGroups: false })

        expect(screen.queryByText('Работа')).toBeNull()
        expect(screen.queryByText('Добавить группу')).toBeNull()
    })

    it('shows existing groups and priorities when their settings are on', () => {
        renderScreen()

        expect(screen.getByText('Работа')).toBeTruthy()
        expect(screen.getByText('Высокий')).toBeTruthy()
    })

    it('opens the create sheet when "Добавить группу" is pressed', () => {
        renderScreen()

        fireEvent.press(screen.getByText('Добавить группу'))

        expect(screen.getByText('Новая группа')).toBeTruthy()
    })

    it('creates a group from the sheet with the trimmed label and chosen color', () => {
        const onCreateGroup = jest.fn()
        renderScreen({ onCreateGroup })

        fireEvent.press(screen.getByText('Добавить группу'))
        fireEvent.changeText(screen.getByPlaceholderText('Название'), 'Дом')
        fireEvent.press(screen.getByLabelText('accent-green'))
        fireEvent.press(screen.getByText('Сохранить'))

        expect(onCreateGroup).toHaveBeenCalledWith({
            label: 'Дом',
            color: 'accent-green',
        })
    })

    it('opens the edit sheet (not the create one) when an existing group is pressed', () => {
        renderScreen()

        fireEvent.press(screen.getByText('Работа'))

        expect(screen.getByText('Группа')).toBeTruthy()
        expect(screen.getByDisplayValue('Работа')).toBeTruthy()
    })

    it('deletes a group from its edit sheet', () => {
        const onDeleteGroup = jest.fn()
        renderScreen({ onDeleteGroup })

        fireEvent.press(screen.getByText('Работа'))
        fireEvent.press(screen.getByText('Удалить'))
        expect(onDeleteGroup).not.toHaveBeenCalled()
        // The first press swaps the sheet's own content to the delete
        // confirmation instead of opening a second modal on top — so the
        // confirm button reuses the same "Удалить" label, now alone.
        fireEvent.press(screen.getByText('Удалить'))

        expect(onDeleteGroup).toHaveBeenCalledWith('group-work')
    })

    it('allows a priority to be saved with no color at all', () => {
        const onCreatePriority = jest.fn()
        renderScreen({ onCreatePriority })

        fireEvent.press(screen.getByText('Добавить приоритет'))
        fireEvent.changeText(screen.getByPlaceholderText('Название'), 'Низкий')
        fireEvent.press(screen.getByText('Сохранить'))

        expect(onCreatePriority).toHaveBeenCalledWith({
            label: 'Низкий',
            color: null,
        })
    })

    it('calls onToggleHabitCategories when the Категории привычек switch is flipped', () => {
        const onToggleHabitCategories = jest.fn()
        renderScreen({ onToggleHabitCategories })

        fireEvent(screen.getAllByRole('switch')[2], 'onValueChange', true)

        expect(onToggleHabitCategories).toHaveBeenCalledWith(true)
    })

    it('hides the habit category list when the setting is off', () => {
        renderScreen({
            useHabitCategories: false,
            habitCategories: HABIT_CATEGORIES,
        })

        expect(screen.queryByText('Здоровье')).toBeNull()
    })

    it('shows existing habit categories once the setting is on', () => {
        renderScreen({
            useHabitCategories: true,
            habitCategories: HABIT_CATEGORIES,
        })

        expect(screen.getByText('Здоровье')).toBeTruthy()
    })

    it('creates a habit category from the sheet', () => {
        const onCreateHabitCategory = jest.fn()
        renderScreen({ useHabitCategories: true, onCreateHabitCategory })

        fireEvent.press(screen.getByText('Добавить категорию'))
        fireEvent.changeText(screen.getByPlaceholderText('Название'), 'Спорт')
        fireEvent.press(screen.getByText('Сохранить'))

        expect(onCreateHabitCategory).toHaveBeenCalledWith({
            label: 'Спорт',
            color: null,
        })
    })

    it('calls onChangeAccent when an accent swatch is pressed', () => {
        const onChangeAccent = jest.fn()
        renderScreen({ onChangeAccent })

        fireEvent.press(screen.getByLabelText('Красный'))

        expect(onChangeAccent).toHaveBeenCalledWith('red')
    })

    it('shows the current theme mode next to the Тема row', () => {
        renderScreen({ themeMode: 'dark' })

        expect(screen.getByText('Тёмная')).toBeTruthy()
    })

    it('shows every section when no context is given', () => {
        renderScreen()

        expect(screen.getByText('Статусы')).toBeTruthy()
        expect(screen.getByText('Группы')).toBeTruthy()
        expect(screen.getByText('Категории')).toBeTruthy()
    })

    it('hides the habit-categories section when opened from the tasks screen', () => {
        renderScreen({ context: 'tasks' })

        expect(screen.getByText('Статусы')).toBeTruthy()
        expect(screen.getByText('Группы')).toBeTruthy()
        expect(screen.queryByText('Категории')).toBeNull()
    })

    it('hides task statuses and the tasks section when opened from the habits screen', () => {
        renderScreen({ context: 'habits' })

        expect(screen.queryByText('Статусы')).toBeNull()
        expect(screen.queryByText('Группы')).toBeNull()
        expect(screen.getByText('Категории')).toBeTruthy()
    })

    it('only shows general settings and diagnostics when opened from the calendar', () => {
        renderScreen({
            context: 'calendar',
            onDownloadLogs: noop,
        })

        expect(screen.queryByText('Статусы')).toBeNull()
        expect(screen.queryByText('Группы')).toBeNull()
        expect(screen.queryByText('Категории')).toBeNull()
        expect(screen.getByText('Общие настройки')).toBeTruthy()
        expect(screen.getByText('Диагностика')).toBeTruthy()
    })
})

it('removes the calendar section from settings', () => {
    renderScreen({
        calendarOptions: { showTasks: true, showHabits: true },
        onChangeCalendarOptions: jest.fn(),
    })
    expect(screen.queryByText('Календарь')).toBeNull()
    expect(screen.queryByTestId('calendar-show-tasks')).toBeNull()
    expect(screen.queryByTestId('calendar-show-habits')).toBeNull()
})

it('uses the same settings menu for language above appearance', () => {
    const onChangeLanguage = jest.fn()
    renderScreen({ language: 'ru', onChangeLanguage })
    expect(screen.getByText('Язык')).toBeTruthy()
    expect(screen.getByText('Оформление')).toBeTruthy()
    fireEvent.press(screen.getByText('Русский'))
    fireEvent.press(screen.UNSAFE_getByProps({ label: 'English' }))
    expect(onChangeLanguage).toHaveBeenCalledWith('en')
})
