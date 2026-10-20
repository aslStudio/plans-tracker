import { Colors } from '@/shared/config/theme'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { fireEvent } from '@testing-library/react-native'

import {
    defaultTaskPriorities,
    defaultTaskStatuses,
    TODO_STATUS_ID,
} from '@/shared/api'
import { render, screen } from '@/shared/lib/test-utils'

import { createEmptyDraft } from './lib/draft'
import { TaskDetailsScreen } from './TaskDetailsScreen'
jest.mock('@/shared/lib/toast/app-toast', () => ({ showAppToast: jest.fn() }))

const GROUPS = [
    {
        id: 'group-work',
        label: 'Работа',
        color: 'accent-blue' as const,
        order: 0,
    },
]

const noop = () => {}

function renderScreen(
    overrides: Partial<Parameters<typeof TaskDetailsScreen>[0]> = {},
) {
    return render(
        <TaskDetailsScreen
            draft={createEmptyDraft()}
            statuses={defaultTaskStatuses}
            groups={GROUPS}
            priorities={defaultTaskPriorities}
            useGroups
            usePriority
            isNew
            onChange={noop}
            onClose={noop}
            onSave={noop}
            {...overrides}
        />,
    )
}

describe('TaskDetailsScreen', () => {
    it('shows the "Название" title placeholder while creating', () => {
        renderScreen({ isNew: true })

        expect(screen.getByPlaceholderText('Название')).toBeTruthy()
    })

    it('shows the "Название" title placeholder while editing', () => {
        renderScreen({ isNew: false })

        expect(screen.getByPlaceholderText('Название')).toBeTruthy()
    })

    it('calls onChange with the new title as the user types', () => {
        const onChange = jest.fn()
        renderScreen({ onChange })

        fireEvent.changeText(
            screen.getByPlaceholderText('Название'),
            'Собрать чемодан',
        )

        expect(onChange).toHaveBeenCalledWith({ title: 'Собрать чемодан' })
    })

    it('renders the current status label', () => {
        renderScreen({
            draft: { ...createEmptyDraft(), statusId: TODO_STATUS_ID },
        })

        expect(screen.getAllByText('К выполнению')).toHaveLength(2)
    })

    it('hides the group row when useGroups is off', () => {
        renderScreen({ useGroups: false })

        expect(screen.queryByText('Группа')).toBeNull()
    })

    it('shows "Без группы" for a group-enabled task with none set', () => {
        renderScreen({
            useGroups: true,
            draft: { ...createEmptyDraft(), groupId: null },
        })

        expect(screen.getByText('Без группы')).toBeTruthy()
    })

    it('hides the priority row when usePriority is off', () => {
        renderScreen({ usePriority: false })

        expect(screen.queryByText('Приоритет')).toBeNull()
    })

    it('always renders both date rows', () => {
        renderScreen()

        expect(screen.getByText('Дата начала')).toBeTruthy()
        expect(screen.getByText('Дата окончания')).toBeTruthy()
    })

    it('adds a weekly recurrence and anchors an undated task on today', () => {
        const onChange = jest.fn()
        renderScreen({ onChange, useTaskRecurrence: true })

        fireEvent.press(screen.getByText('Каждую неделю'))

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                repeat: { type: 'weekly', daysOfWeek: [new Date().getDay()] },
            }),
        )
    })

    it('always offers recurrence and calendar opt-in', () => {
        renderScreen()
        expect(screen.getByText('Повторение')).toBeTruthy()
        expect(screen.getByTestId('show-in-calendar').props.value).toBe(false)
    })

    it('shows time controls when calendar task time is enabled', () => {
        renderScreen({ useTaskTime: true })
        expect(screen.getByText('Добавить в календарь')).toBeTruthy()
    })

    it('calls onClose when the close button is pressed', () => {
        const onClose = jest.fn()
        renderScreen({ onClose })

        fireEvent.press(screen.getByRole('button', { name: 'Закрыть' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it.each(['', '   '])(
        'highlights a missing title and shows a toast: %j',
        (title) => {
            const onSave = jest.fn()
            renderScreen({ onSave, draft: { ...createEmptyDraft(), title } })
            fireEvent.press(screen.getByText('Сохранить'))
            expect(onSave).not.toHaveBeenCalled()
            expect(showAppToast).toHaveBeenLastCalledWith({
                title: 'Нужно ввести название',
                description: 'Добавьте название задачи',
                animation: 'warning',
            })
            expect(
                screen.getByPlaceholderText('Название').props
                    .placeholderTextColor,
            ).toBe(Colors.light.accent.red)
        },
    )

    it('calls onSave when the floating "Сохранить" button is pressed', () => {
        const onSave = jest.fn()
        renderScreen({
            onSave,
            draft: { ...createEmptyDraft(), title: 'Название' },
        })

        fireEvent.press(screen.getByText('Сохранить'))

        expect(onSave).toHaveBeenCalledTimes(1)
    })

    it("colors the priority value with the priority's own color", () => {
        const priorities = [
            {
                id: 'priority-high',
                label: 'Высокий',
                color: 'accent-red' as const,
                order: 0,
                isBuiltIn: true,
            },
        ]
        renderScreen({
            priorities,
            draft: { ...createEmptyDraft(), priorityId: 'priority-high' },
        })

        expect(screen.getAllByText('Высокий').at(-1)).toHaveStyle({
            color: 'rgba(255, 56, 60, 1)',
        })
    })

    it('falls back to the default label color when the entity has none set', () => {
        renderScreen({ draft: { ...createEmptyDraft(), groupId: null } })

        const label = screen.getByText('Без группы')
        expect(label).not.toHaveStyle({ color: 'rgba(255, 56, 60, 1)' })
    })

    it('renders the description editor with its inline-mark pins', () => {
        renderScreen()

        expect(screen.getByRole('button', { name: 'Жирный' })).toBeTruthy()
        // "Готово" only shows up once the editor is actually focused.
        expect(screen.queryByRole('button', { name: 'Готово' })).toBeNull()
        fireEvent(screen.getByPlaceholderText('Описание'), 'focus')
        expect(screen.getByRole('button', { name: 'Готово' })).toBeTruthy()
    })

    it('toggles bold when the "Жирный" pin is pressed', () => {
        renderScreen()

        fireEvent(screen.getByPlaceholderText('Описание'), 'focus')
        fireEvent.press(screen.getByRole('button', { name: 'Жирный' }))
        // No crash + the pin is still there — the editor itself is mocked,
        // so this only proves the wiring reaches `editor.toggleBold`.
        expect(screen.getByRole('button', { name: 'Жирный' })).toBeTruthy()
    })

    it('hides the delete button while creating a new task', () => {
        renderScreen({ isNew: true, onDelete: undefined })

        expect(
            screen.queryByRole('button', { name: 'Удалить задачу' }),
        ).toBeNull()
    })

    it('calls onDelete when the delete button is pressed while editing', () => {
        const onDelete = jest.fn()
        renderScreen({ isNew: false, onDelete })

        fireEvent.press(screen.getByRole('button', { name: 'Удалить задачу' }))
        expect(onDelete).not.toHaveBeenCalled()
        fireEvent.press(screen.getByText('Удалить'))

        expect(onDelete).toHaveBeenCalledTimes(1)
    })
})

it('opts into the calendar with a default time and duration', () => {
    const onChange = jest.fn()
    renderScreen({ onChange })
    expect(screen.getByTestId('show-in-calendar').props.value).toBe(false)
    fireEvent(screen.getByTestId('show-in-calendar'), 'valueChange', true)
    expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ startMinute: 540, durationMinutes: 60 }),
    )
})

it('enables optional choices with their first option', () => {
    const onChange = jest.fn()
    renderScreen({ onChange })
    fireEvent.press(screen.getByRole('radio', { name: 'Готово' }))
    expect(onChange).toHaveBeenCalledWith({ statusId: 'status-done' })
    expect(screen.queryByRole('radio', { name: 'Работа' })).toBeNull()
    fireEvent(screen.getByTestId('choice-toggle-Группа'), 'valueChange', true)
    expect(onChange).toHaveBeenCalledWith({ groupId: 'group-work' })
    fireEvent(
        screen.getByTestId('choice-toggle-Приоритет'),
        'valueChange',
        true,
    )
    expect(onChange).toHaveBeenCalledWith({
        priorityId: defaultTaskPriorities[0].id,
    })
})

it('shows saved selections while editing and allows clearing optional properties', () => {
    const onChange = jest.fn()
    renderScreen({
        isNew: false,
        onChange,
        draft: {
            ...createEmptyDraft(),
            groupId: 'group-work',
            priorityId: 'priority-high',
        },
    })
    expect(
        screen.getByRole('radio', { name: 'Работа', selected: true }),
    ).toBeTruthy()
    expect(
        screen.getByRole('radio', { name: 'Высокий', selected: true }),
    ).toBeTruthy()
    fireEvent.press(screen.getByRole('radio', { name: 'Работа' }))
    expect(onChange).not.toHaveBeenCalled()
    fireEvent(screen.getByTestId('choice-toggle-Группа'), 'valueChange', false)
    expect(onChange).toHaveBeenCalledWith({ groupId: null })
    fireEvent.press(screen.getByRole('radio', { name: 'Высокий' }))
    expect(onChange).not.toHaveBeenCalledWith({ priorityId: null })
    fireEvent(
        screen.getByTestId('choice-toggle-Приоритет'),
        'valueChange',
        false,
    )
    expect(onChange).toHaveBeenCalledWith({ priorityId: null })
})

it('hides optional choice sections when no options exist', () => {
    renderScreen({ groups: [], priorities: [] })
    expect(screen.queryByText('Группа')).toBeNull()
    expect(screen.queryByText('Приоритет')).toBeNull()
    expect(screen.getByText('Статус')).toBeTruthy()
})

it('uses empty descriptions without offering separate empty choices', () => {
    renderScreen()
    expect(screen.getByText('Без группы')).toBeTruthy()
    expect(screen.getByText('Без приоритета')).toBeTruthy()
    expect(screen.getByText('Без повторения')).toBeTruthy()
    expect(screen.queryByRole('radio', { name: 'Без группы' })).toBeNull()
    expect(screen.queryByRole('radio', { name: 'Без приоритета' })).toBeNull()
    expect(screen.queryByText('Не повторять')).toBeNull()
})

it('clears recurrence when its selected cadence is tapped again', () => {
    const onChange = jest.fn()
    renderScreen({
        onChange,
        draft: { ...createEmptyDraft(), repeat: { type: 'daily' } },
    })
    fireEvent.press(
        screen.getByRole('button', { name: 'Каждый день', selected: true }),
    )
    expect(onChange).toHaveBeenCalledWith({ repeat: null })
})

it('keeps the mandatory status selected when tapped again', () => {
    const onChange = jest.fn()
    renderScreen({ onChange })
    fireEvent.press(
        screen.getByRole('radio', { name: 'К выполнению', selected: true }),
    )
    expect(onChange).not.toHaveBeenCalled()
})

it('edits the plain note independently and removes pasted line breaks', () => {
    const onChange = jest.fn()
    renderScreen({ onChange })
    const note = screen.getByPlaceholderText('Заметка/ссылка')
    fireEvent.changeText(note, 'Ссылка\nhttps://example.com')
    expect(onChange).toHaveBeenCalledWith({
        note: 'Ссылка https://example.com',
    })
    expect(note.props.returnKeyType).toBe('done')
    expect(note.props.submitBehavior).toBe('blurAndSubmit')
    expect(note.props.scrollEnabled).toBe(false)
    expect(screen.getByPlaceholderText('Описание')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Жирный' })).toBeTruthy()
})
