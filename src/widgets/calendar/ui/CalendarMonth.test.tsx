import type {
    CalendarEvent,
    CalendarSettings,
} from '@/shared/api/calendar/model'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { CalendarMonth } from './CalendarMonth'

const event: CalendarEvent = {
    id: 'e1',
    title: 'Встреча',
    date: '2026-10-14',
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
}

const settings: CalendarSettings = { showTasks: true, showHabits: true }

describe('CalendarMonth', () => {
    it('shows the event count for a day with items', () => {
        render(
            <CalendarMonth
                date={new Date(2026, 9, 1)}
                today="2026-10-14"
                events={[event]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                onSelect={() => {}}
            />,
        )

        expect(screen.getByLabelText('2026-10-14, событий: 1')).toBeTruthy()
    })

    it('calls onSelect with the pressed date', () => {
        const onSelect = jest.fn()
        render(
            <CalendarMonth
                date={new Date(2026, 9, 1)}
                today="2026-10-14"
                events={[event]}
                tasks={[]}
                habits={[]}
                completionState={{}}
                settings={settings}
                onSelect={onSelect}
            />,
        )

        fireEvent.press(screen.getByLabelText('2026-10-14, событий: 1'))

        expect(onSelect).toHaveBeenCalledWith(
            '2026-10-14',
            expect.any(Number),
            expect.any(Number),
        )
    })
})
