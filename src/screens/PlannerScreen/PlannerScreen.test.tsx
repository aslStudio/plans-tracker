import { useEffect } from 'react'
import { View } from 'react-native'
import { State } from 'react-native-gesture-handler'
import {
    fireGestureHandler,
    getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { tasksRepository, habitsRepository } from '@/shared/api'
import {
    todayDateString,
    addDays,
    parseLocalDateString,
} from '@/shared/lib/date'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@/shared/lib/test-utils'
import { minuteAtDrop } from '@/entities/calendar-event'
import {
    calendarRepository,
    calendarSettings,
} from '@/shared/api/calendar/repository'
import { CalendarTimeline } from '@/widgets/calendar'
import { PlannerScreen } from './PlannerScreen'

const mockPush = jest.fn()
const mockFocusEffect = function useMockFocusEffect(
    callback: () => (() => void) | void,
) {
    useEffect(callback, [callback])
}
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (callback: () => (() => void) | void) =>
        mockFocusEffect(callback),
}))
afterEach(() => jest.restoreAllMocks())
beforeEach(async () => {
    await AsyncStorage.clear()
    mockPush.mockClear()
})
it('shows a timed task and opens its original editor', async () => {
    const task = await tasksRepository.create({
        title: 'Фокус',
        startDate: todayDateString(),
        startMinute: 557,
        durationMinutes: 43,
    })
    render(<PlannerScreen />)
    const item = await screen.findByRole('button', {
        name: 'Фокус, 09:17, 43 минут',
    })
    fireEvent.press(item)
    expect(mockPush).toHaveBeenCalledWith(`/task/${task.id}`)
})
it('opens a new plan in a modal route', async () => {
    render(<PlannerScreen />)
    fireEvent.press(
        await screen.findByRole('button', { name: 'Добавить событие' }),
    )
    expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
            pathname: '/plan/[id]',
            params: expect.objectContaining({
                id: 'new',
                day: todayDateString(),
            }),
        }),
    )
})
it('opens plan creation and editing in a modal route', async () => {
    const habit = await habitsRepository.create({
        title: 'Читать',
        repeat: { type: 'daily' },
    })
    const event = await calendarRepository.save({
        id: '',
        title: 'Вечернее чтение',
        date: todayDateString(),
        startMinute: 600,
        duration: 30,
        allDay: false,
        color: '#6875E8',
        notes: '',
        location: '',
        repeat: null,
        until: null,
        excludedDates: [],
        link: { type: 'habit', id: habit.id },
    })
    render(<PlannerScreen />)
    fireEvent.press(
        await screen.findByRole('button', {
            name: 'Читать, 10:00, 30 минут',
        }),
    )

    expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
            pathname: '/plan/[id]',
            params: expect.objectContaining({
                id: event.id,
                day: todayDateString(),
            }),
        }),
    )
})
it('switches to month and returns to the selected day', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })
    fireEvent.press(screen.UNSAFE_getByProps({ label: 'Месяц' }))
    fireEvent.press(
        screen.getByRole('button', {
            name: `${todayDateString()}, событий: 0`,
        }),
    )
    expect(
        screen.getByRole('button', { name: 'Добавить событие в 09:00' }),
    ).toBeTruthy()
})
it('pages the day view by a single day with the arrows, not a week', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })

    expect(screen.getByRole('button', { name: 'Предыдущий день' })).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'Следующий день' }))

    const label = parseLocalDateString(
        addDays(todayDateString(), 1),
    ).toLocaleDateString('ru-RU')
    expect(
        screen.getByRole('button', { name: label }).props.accessibilityState
            .selected,
    ).toBe(true)
})
it('switches to the week view and pages by a full week with the arrows', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })

    fireEvent.press(screen.UNSAFE_getByProps({ label: 'Неделя' }))
    expect(
        screen.getByRole('button', { name: 'Предыдущая неделя' }),
    ).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'Следующая неделя' }))

    const label = parseLocalDateString(
        addDays(todayDateString(), 7),
    ).toLocaleDateString('ru-RU')
    expect(screen.getByLabelText(label)).toBeTruthy()
})
it('switches to the 3-day view and pages by 3 days with the arrows', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })

    fireEvent.press(screen.UNSAFE_getByProps({ label: '3 дня' }))
    expect(
        screen.getByRole('button', { name: 'Предыдущие 3 дня' }),
    ).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'Следующие 3 дня' }))

    const label = parseLocalDateString(
        addDays(todayDateString(), 3),
    ).toLocaleDateString('ru-RU')
    expect(screen.getByLabelText(label)).toBeTruthy()
})
it('opens the editor with the tapped time slot prefilled', async () => {
    render(<PlannerScreen />)
    fireEvent.press(
        await screen.findByRole('button', { name: 'Добавить событие в 09:30' }),
    )
    const target = mockPush.mock.calls.at(-1)![0]
    expect(target.pathname).toBe('/plan/[id]')
    expect(JSON.parse(target.params.draft)).toEqual(
        expect.objectContaining({
            startMinute: 570,
            date: todayDateString(),
        }),
    )
})
it('opens shared settings and removes the old calendar controls', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })
    expect(screen.queryByText('Сегодня')).toBeNull()
    expect(screen.queryByText('ВАШ ДЕНЬ, В ВАШЕМ РИТМЕ')).toBeNull()
    fireEvent.press(screen.getByRole('button', { name: 'Настройки' }))
    expect(mockPush).toHaveBeenCalledWith({
        pathname: '/settings',
        params: { from: 'calendar' },
    })
})
it('collapses and expands the calendar header smoothly', async () => {
    await tasksRepository.create({ title: 'Незапланированная задача' })
    render(<PlannerScreen />)
    await screen.findByText('Не привязано к календарю')

    fireEvent.press(
        screen.getByRole('button', { name: 'Свернуть шапку календаря' }),
    )
    expect(screen.queryByText('Не привязано к календарю')).toBeNull()
    expect(screen.queryByTestId('calendar-view-switcher')).toBeNull()
    expect(
        screen.getByRole('button', {
            name: parseLocalDateString(todayDateString()).toLocaleDateString(
                'ru-RU',
            ),
        }),
    ).toBeTruthy()

    fireEvent.press(
        screen.getByRole('button', { name: 'Развернуть шапку календаря' }),
    )
    expect(await screen.findByText('Не привязано к календарю')).toBeTruthy()
    expect(screen.getByTestId('calendar-view-switcher')).toBeTruthy()
})
it('opens the editor with an unplanned habit linked', async () => {
    const habit = await habitsRepository.create({
        title: 'Чтение',
        repeat: { type: 'daily' },
    })
    render(<PlannerScreen />)
    fireEvent.press(
        await screen.findByRole('button', { name: 'Запланировать: Чтение' }),
    )
    const target = mockPush.mock.calls.at(-1)![0]
    expect(target.pathname).toBe('/plan/[id]')
    expect(JSON.parse(target.params.draft)).toEqual(
        expect.objectContaining({
            title: 'Чтение',
            link: { type: 'habit', id: habit.id },
            repeat: { type: 'daily' },
        }),
    )
})
function swipeCalendar(id: string, cancelled = false) {
    act(() =>
        fireGestureHandler(getByGestureTestId(id), [
            { state: State.BEGAN, translationX: 0 },
            { state: State.ACTIVE, translationX: -35 },
            {
                state: cancelled ? State.CANCELLED : State.END,
                translationX: -100,
                velocityX: -800,
            },
        ]),
    )
}
it('swipes individual days and weeks without changing date on cancelled gestures', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })
    swipeCalendar('calendar-days', true)
    const label = (offset: number) =>
        parseLocalDateString(
            addDays(todayDateString(), offset),
        ).toLocaleDateString('ru-RU')
    expect(
        screen.getByRole('button', { name: label(0) }).props.accessibilityState
            .selected,
    ).toBe(true)
    swipeCalendar('calendar-days')
    expect(
        screen.getByRole('button', { name: label(1) }).props.accessibilityState
            .selected,
    ).toBe(true)
    swipeCalendar('calendar-weeks')
    expect(
        screen.getByRole('button', { name: label(8) }).props.accessibilityState
            .selected,
    ).toBe(true)
})
it('swipes months and restores the selected date when switching back to the day', async () => {
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })
    fireEvent.press(screen.UNSAFE_getByProps({ label: 'Месяц' }))
    swipeCalendar('calendar-months')
    const date = parseLocalDateString(todayDateString())
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    const label = nextMonth.toLocaleDateString('ru-RU')
    fireEvent.press(screen.UNSAFE_getByProps({ label: 'День' }))
    expect(
        screen.getByRole('button', { name: label }).props.accessibilityState
            .selected,
    ).toBe(true)
})
it('opens a prefilled editor when a habit is dropped into the scrolled timeline', async () => {
    const habit = await habitsRepository.create({
        title: 'Перенос чтения',
        repeat: { type: 'daily' },
    })
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Запланировать: Перенос чтения' })
    for (const node of screen.UNSAFE_getAllByType(View)) {
        const instance = node.instance as {
            measureInWindow?: (
                callback: (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                ) => void,
            ) => void
        } | null
        if (instance?.measureInWindow)
            jest.spyOn(instance, 'measureInWindow').mockImplementation(
                function (this: { props: { testID?: string } }, callback) {
                    callback(
                        0,
                        this.props.testID === 'calendar-timeline-viewport'
                            ? 300
                            : 0,
                        400,
                        500,
                    )
                },
            )
    }
    act(() =>
        fireGestureHandler(getByGestureTestId(`unplanned-habit-${habit.id}`), [
            { state: State.BEGAN, absoluteX: 150, absoluteY: 200 },
            { state: State.ACTIVE, absoluteX: 150, absoluteY: 200 },
            { state: State.ACTIVE, absoluteX: 150, absoluteY: 450 },
            { state: State.END, absoluteX: 150, absoluteY: 450 },
        ]),
    )
    const minute = minuteAtDrop(
        150,
        450,
        { x: 0, y: 300, width: 400, height: 500 },
        screen.UNSAFE_getByType(CalendarTimeline).props.initialOffset,
        76,
    )!
    const target = mockPush.mock.calls.at(-1)![0]
    expect(target.pathname).toBe('/plan/[id]')
    expect(JSON.parse(target.params.draft)).toEqual(
        expect.objectContaining({
            title: 'Перенос чтения',
            startMinute: minute,
            date: todayDateString(),
            link: { type: 'habit', id: habit.id },
            repeat: { type: 'daily' },
        }),
    )
})

it('restores the selected view after reopening the calendar', async () => {
    const first = render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Добавить событие в 09:00' })
    fireEvent.press(screen.UNSAFE_getByProps({ label: 'Неделя' }))
    await waitFor(async () =>
        expect((await calendarSettings.get()).viewMode).toBe('week'),
    )
    first.unmount()
    render(<PlannerScreen />)
    await screen.findByRole('button', { name: 'Предыдущая неделя' })
    expect(screen.queryByRole('button', { name: 'Предыдущий день' })).toBeNull()
})
