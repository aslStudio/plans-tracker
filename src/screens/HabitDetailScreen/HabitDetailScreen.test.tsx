import { Colors } from '@/shared/config/theme'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { fireEvent } from '@testing-library/react-native'

import { todayDateString } from '@/shared/lib/date'
import { render, screen } from '@/shared/lib/test-utils'

import { createEmptyDraft } from '@/features/edit-habit'
import { HabitDetailScreen } from './HabitDetailScreen'
jest.mock('@/shared/lib/toast/app-toast', () => ({ showAppToast: jest.fn() }))

const now = new Date().toISOString()
const today = todayDateString()

const CATEGORIES = [
    {
        id: 'health',
        label: 'Здоровье',
        order: 0,
        color: 'accent-green' as const,
    },
]

const habit = {
    id: '1',
    title: 'Пить воду',
    categoryId: null,
    repeat: { type: 'daily' as const },
    createdAt: now,
    updatedAt: now,
}

const noop = () => {}
const noopAsync = async () => CATEGORIES[0]

function renderScreen(
    overrides: Partial<Parameters<typeof HabitDetailScreen>[0]> = {},
) {
    return render(
        <HabitDetailScreen
            draft={createEmptyDraft()}
            habit={null}
            categories={CATEGORIES}
            useCategories
            completions={[]}
            today={today}
            isNew
            onChange={noop}
            onSetCompletion={jest.fn()}
            onCreateCategory={noopAsync}
            onClose={noop}
            onSave={noop}
            {...overrides}
        />,
    )
}

describe('HabitDetailScreen', () => {
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
            'Пить воду',
        )

        expect(onChange).toHaveBeenCalledWith({ title: 'Пить воду' })
    })

    it('shows "Без категории" with none set', () => {
        renderScreen()

        expect(screen.getByText('Без категории')).toBeTruthy()
    })

    it('shows the category label once one is set', () => {
        renderScreen({ draft: { ...createEmptyDraft(), categoryId: 'health' } })

        expect(
            screen.getByRole('radio', { name: 'Здоровье', selected: true }),
        ).toBeTruthy()
    })

    it('hides the category row entirely when the setting is off', () => {
        renderScreen({ useCategories: false })

        expect(screen.queryByText('Категория')).toBeNull()
    })

    it('shows the daily repeat summary by default', () => {
        renderScreen()

        expect(screen.getByRole('button', { name: 'Каждый день' })).toBeTruthy()
    })

    it('shows weekday chips once the repeat is weekly', () => {
        renderScreen({
            draft: {
                ...createEmptyDraft(),
                repeat: { type: 'weekly', daysOfWeek: [1, 3, 5] },
            },
        })

        expect(screen.getByText('Каждую неделю')).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Пн' })).toBeTruthy()
    })

    it('toggles a weekday chip through onChange', () => {
        const onChange = jest.fn()
        renderScreen({
            draft: {
                ...createEmptyDraft(),
                repeat: { type: 'weekly', daysOfWeek: [1, 3, 5] },
            },
            onChange,
        })

        fireEvent.press(screen.getByRole('button', { name: 'Вт' }))

        expect(onChange).toHaveBeenCalledWith({
            repeat: { type: 'weekly', daysOfWeek: [1, 3, 5, 2] },
        })
    })

    it('hides the progress section and delete button while creating', () => {
        renderScreen({ isNew: true, habit: null, onDelete: undefined })

        expect(screen.queryByText('Прогресс')).toBeNull()
        expect(
            screen.queryByRole('button', { name: 'Удалить привычку' }),
        ).toBeNull()
    })

    it('shows the progress section while editing an existing habit', () => {
        renderScreen({ isNew: false, habit })

        expect(screen.getByText('Прогресс')).toBeTruthy()
    })

    it("shows today's completion status while editing a habit", () => {
        const { rerender } = renderScreen({ isNew: false, habit })
        expect(screen.getByText('Не выполнено')).toBeTruthy()

        rerender(
            <HabitDetailScreen
                draft={createEmptyDraft()}
                habit={habit}
                categories={CATEGORIES}
                useCategories
                completions={[
                    {
                        id: 'completion-1',
                        habitId: habit.id,
                        occurrenceDate: today,
                        completedAt: now,
                    },
                ]}
                today={today}
                isNew={false}
                onChange={noop}
                onSetCompletion={jest.fn()}
                onCreateCategory={noopAsync}
                onClose={noop}
                onSave={noop}
            />,
        )
        expect(screen.getByText('Выполнено')).toBeTruthy()
    })

    it('calls onDelete when the delete button is pressed while editing', () => {
        const onDelete = jest.fn()
        renderScreen({ isNew: false, habit, onDelete })

        fireEvent.press(
            screen.getByRole('button', { name: 'Удалить привычку' }),
        )
        expect(onDelete).not.toHaveBeenCalled()
        fireEvent.press(screen.getByText('Удалить'))

        expect(onDelete).toHaveBeenCalledTimes(1)
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
                description: 'Добавьте название привычки',
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

    it('loads the description content into the editor', () => {
        renderScreen({
            draft: {
                ...createEmptyDraft(),
                description: '<p>Два литра в день</p>',
            },
        })

        expect(screen.getByDisplayValue('<p>Два литра в день</p>')).toBeTruthy()
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

it('enables the first category and clears it only with the toggle', () => {
    const onChange = jest.fn()
    const view = renderScreen({ onChange })
    expect(screen.queryByRole('radio', { name: 'Здоровье' })).toBeNull()
    fireEvent(
        screen.getByTestId('choice-toggle-Категория'),
        'valueChange',
        true,
    )
    expect(onChange).toHaveBeenLastCalledWith({ categoryId: 'health' })
    view.unmount()
    onChange.mockClear()
    renderScreen({
        onChange,
        draft: { ...createEmptyDraft(), categoryId: 'health' },
    })
    fireEvent.press(
        screen.getByRole('radio', { name: 'Здоровье', selected: true }),
    )
    expect(onChange).not.toHaveBeenCalled()
    fireEvent(
        screen.getByTestId('choice-toggle-Категория'),
        'valueChange',
        false,
    )
    expect(onChange).toHaveBeenLastCalledWith({ categoryId: null })
})

it('opens creation when enabling an empty category list', () => {
    renderScreen({ categories: [] })
    fireEvent(
        screen.getByTestId('choice-toggle-Категория'),
        'valueChange',
        true,
    )
    expect(screen.getByText('Новая категория')).toBeTruthy()
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
