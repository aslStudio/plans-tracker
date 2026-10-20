import { fireEvent } from '@testing-library/react-native'

import type {
    CalendarEvent,
    CalendarSettings,
} from '@/shared/api/calendar/model'
import { render, screen } from '@/shared/lib/test-utils'

import { CalendarMultiDayTimeline } from './CalendarMultiDayTimeline'

const settings: CalendarSettings = { showTasks: true, showHabits: true }
const dates = ['2026-10-12', '2026-10-13', '2026-10-14']

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
    return {
        id: 'e1',
        title: 'Встреча',
        date: dates[1],
        startMinute: 540,
        duration: 60,
        allDay: false,
        color: '#ff0000',
        notes: '',
        location: '',
        repeat: null,
        until: null,
        excludedDates: [],
        link: null,
        ...overrides,
    }
}

const noop = () => {}

describe('CalendarMultiDayTimeline', () => {
    it('shows each date header', () => {
        render(
            <CalendarMultiDayTimeline
                dates={dates}
                events={[]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                today={dates[0]}
                now={new Date('2026-10-12T10:00:00')}
                onOpen={noop}
                onCreate={noop}
                onSelectDay={noop}
            />,
        )

        for (const date of dates) {
            expect(
                screen.getByLabelText(
                    new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU'),
                ),
            ).toBeTruthy()
        }
    })

    it('opens an event on its own column when pressed', () => {
        const onOpen = jest.fn()
        render(
            <CalendarMultiDayTimeline
                dates={dates}
                events={[event({})]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                today={dates[0]}
                now={new Date('2026-10-12T10:00:00')}
                onOpen={onOpen}
                onCreate={noop}
                onSelectDay={noop}
            />,
        )

        fireEvent.press(screen.getByText('Встреча'))

        expect(onOpen).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'e1', title: 'Встреча' }),
        )
    })

    it('calls onCreate with the pressed column\'s date', () => {
        const onCreate = jest.fn()
        render(
            <CalendarMultiDayTimeline
                dates={dates}
                events={[]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                today={dates[0]}
                now={new Date('2026-10-12T10:00:00')}
                onOpen={noop}
                onCreate={onCreate}
                onSelectDay={noop}
            />,
        )

        fireEvent.press(
            screen.getAllByLabelText(`Добавить событие, ${dates[1]}`)[0],
        )

        expect(onCreate).toHaveBeenCalledWith(dates[1], 0)
    })

    it('calls onSelectDay when a header is pressed, with a fractional zoom origin', () => {
        const onSelectDay = jest.fn()
        render(
            <CalendarMultiDayTimeline
                dates={dates}
                events={[]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                today={dates[0]}
                now={new Date('2026-10-12T10:00:00')}
                onOpen={noop}
                onCreate={noop}
                onSelectDay={onSelectDay}
            />,
        )

        fireEvent.press(
            screen.getByLabelText(
                new Date(`${dates[1]}T00:00:00`).toLocaleDateString('ru-RU'),
            ),
        )

        expect(onSelectDay).toHaveBeenCalledWith(dates[1], 0, -0.4)
    })

    it('shows an all-day item as a chip above the hourly grid', () => {
        render(
            <CalendarMultiDayTimeline
                dates={dates}
                events={[event({ allDay: true, title: 'Весь день' })]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                today={dates[0]}
                now={new Date('2026-10-12T10:00:00')}
                onOpen={noop}
                onCreate={noop}
                onSelectDay={noop}
            />,
        )

        expect(screen.getByText('Весь день')).toBeTruthy()
    })
})
