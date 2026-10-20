import { showAppToast } from '@/shared/lib/toast/app-toast'
import { fireEvent, render, screen, waitFor } from '@/shared/lib/test-utils'
import { emptyEvent } from '@/entities/calendar-event'
import { Colors } from '@/shared/config/theme'
import { EventEditor } from './EventEditor'
jest.mock('@/shared/lib/toast/app-toast', () => ({ showAppToast: jest.fn() }))

function setup() {
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(
        <EventEditor
            initial={emptyEvent('2026-10-13')}
            tasks={[]}
            habits={[]}
            onSave={onSave}
            onClose={jest.fn()}
            onDelete={jest.fn()}
            onOpenLink={jest.fn()}
        />,
    )
    return onSave
}
it('restores time and repeat fields after repeated disclosure toggles', () => {
    setup()
    for (let i = 0; i < 3; i++) {
        fireEvent(screen.getByRole('switch'), 'valueChange', true)
        expect(screen.queryByText('Время и длительность')).toBeNull()
        fireEvent(screen.getByRole('switch'), 'valueChange', false)
        expect(screen.getByText('Время и длительность')).toBeTruthy()
        fireEvent.press(screen.getByText('Каждую неделю'))
        expect(screen.getByText('Пн')).toBeTruthy()
        fireEvent.press(screen.getByText('Не повторять'))
        expect(screen.queryByText('Пн')).toBeNull()
    }
})
it('saves an event with exact minutes and a recurrence', async () => {
    const save = setup()
    fireEvent.changeText(screen.getByLabelText('Название события'), 'Чтение')
    fireEvent.press(screen.getByText('Время и длительность'))
    fireEvent(
        screen.getByTestId('wheel-Начало · минуты'),
        'momentumScrollEnd',
        {
            nativeEvent: { contentOffset: { y: 17 * 42 } },
        },
    )
    fireEvent(
        screen.getByTestId('wheel-Длительность · часы'),
        'momentumScrollEnd',
        { nativeEvent: { contentOffset: { y: 0 } } },
    )
    fireEvent(
        screen.getByTestId('wheel-Длительность · минуты'),
        'momentumScrollEnd',
        { nativeEvent: { contentOffset: { y: 43 * 42 } } },
    )
    fireEvent.press(screen.getAllByText('Готово').at(-1)!)
    fireEvent.press(screen.getByText('Каждый день'))
    fireEvent.press(screen.getByText('Сохранить'))
    await waitFor(() =>
        expect(save).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Чтение',
                startMinute: 557,
                duration: 43,
                repeat: { type: 'daily' },
            }),
        ),
    )
})
it('keeps the editor open without persisting when the title is empty', () => {
    const save = setup()
    fireEvent.press(screen.getByText('Сохранить'))
    expect(screen.getByText('Добавьте название')).toBeTruthy()
    expect(save).not.toHaveBeenCalled()
})
it('rejects whitespace, highlights the title, and clears the feedback after typing', async () => {
    const save = setup()
    const title = () => screen.getByLabelText('Название события')
    fireEvent.changeText(title(), '   ')
    fireEvent.press(screen.getByText('Сохранить'))
    expect(save).not.toHaveBeenCalled()
    expect(showAppToast).toHaveBeenLastCalledWith({
        title: 'Нужно ввести название',
        description: 'Добавьте название плана',
        animation: 'warning',
    })
    expect(title().props.placeholderTextColor).toBe(
        Colors.light.accent.red,
    )
    fireEvent.changeText(title(), 'Чтение')
    expect(title().props.placeholderTextColor).toBe(
        Colors.light.labels.tertiary,
    )
    expect(screen.queryByText('Добавьте название')).toBeNull()
    fireEvent.press(screen.getByText('Сохранить'))
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
})
it('allows unlinking a deleted entity without opening it', () => {
    const onOpenLink = jest.fn()
    render(
        <EventEditor
            initial={{
                ...emptyEvent('2026-10-13'),
                link: { type: 'task', id: 'deleted-task' },
            }}
            tasks={[]}
            habits={[]}
            onSave={jest.fn().mockResolvedValue(undefined)}
            onClose={jest.fn()}
            onDelete={jest.fn()}
            onOpenLink={onOpenLink}
        />,
    )

    fireEvent.press(screen.getByText('Связанная сущность удалена'))
    expect(onOpenLink).not.toHaveBeenCalled()

    fireEvent.press(screen.getByText('Отвязать'))
    expect(screen.getByText('Связать задачу')).toBeTruthy()
    expect(onOpenLink).not.toHaveBeenCalled()
})
it('saves the selected application accent color', async () => {
    const save = setup()
    fireEvent.changeText(screen.getByLabelText('Название события'), 'План')
    const swatch = screen.getByLabelText('accent-orange')
    const color = Colors.light.accent.orange
    fireEvent.press(swatch)
    fireEvent.press(screen.getByText('Сохранить'))
    await waitFor(() =>
        expect(save).toHaveBeenCalledWith(expect.objectContaining({ color })),
    )
})
it('keeps the draft and offers retry when persistence fails', async () => {
    const save = setup()
    save.mockRejectedValueOnce(new Error('Disk full'))
    fireEvent.changeText(
        screen.getByLabelText('Название события'),
        'Важный план',
    )
    fireEvent.press(screen.getByText('Сохранить'))
    await waitFor(() =>
        expect(
            screen.getByText(
                'Не удалось сохранить изменения. Попробуйте ещё раз.',
            ),
        ).toBeTruthy(),
    )
    expect(screen.getByLabelText('Название события').props.value).toBe(
        'Важный план',
    )
    fireEvent.press(screen.getByText('Сохранить'))
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2))
})

it('edits and saves a formatted description instead of location and notes fields', async () => {
    const save = setup()
    expect(screen.queryByLabelText('Место')).toBeNull()
    expect(screen.queryByLabelText('Заметки')).toBeNull()
    expect(screen.getByRole('button', { name: 'Жирный' })).toBeTruthy()
    fireEvent.changeText(screen.getByLabelText('Название события'), 'План')
    fireEvent(screen.getByPlaceholderText('Описание'), 'changeHtml', {
        nativeEvent: { value: '<p><strong>Описание плана</strong></p>' },
    })
    fireEvent.press(screen.getByText('Сохранить'))
    await waitFor(() =>
        expect(save).toHaveBeenCalledWith(
            expect.objectContaining({
                description: '<p><strong>Описание плана</strong></p>',
            }),
        ),
    )
})
