import { createRef } from 'react'
import { ScrollView, View } from 'react-native'
import type { AgendaItem } from '@/entities/calendar-event'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { CalendarTimeline } from './CalendarTimeline'

const item: AgendaItem = {
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
    source: 'event',
}

function renderTimeline(
    overrides: Partial<Parameters<typeof CalendarTimeline>[0]> = {},
) {
    const viewportRef = createRef<View>()
    const scrollRef = createRef<ScrollView>()
    return render(
        <CalendarTimeline
            items={[item]}
            date="2026-10-14"
            today="2026-10-14"
            now={new Date('2026-10-14T12:00:00')}
            initialOffset={0}
            viewportRef={viewportRef}
            scrollRef={scrollRef}
            dragging={false}
            dropMinute={null}
            onOffset={() => {}}
            onMeasure={() => {}}
            onOpen={() => {}}
            onCreate={() => {}}
            {...overrides}
        />,
    )
}

describe('CalendarTimeline', () => {
    it('renders the given agenda item', () => {
        renderTimeline()

        expect(screen.getByLabelText('Встреча, 09:00, 60 минут')).toBeTruthy()
    })

    it('calls onOpen when an item is pressed', () => {
        const onOpen = jest.fn()
        renderTimeline({ onOpen })

        fireEvent.press(screen.getByLabelText('Встреча, 09:00, 60 минут'))

        expect(onOpen).toHaveBeenCalledWith(item)
    })

    it('calls onCreate with the pressed slot minute', () => {
        const onCreate = jest.fn()
        renderTimeline({ onCreate })

        fireEvent.press(screen.getByLabelText('Добавить событие в 00:00'))

        expect(onCreate).toHaveBeenCalledWith(0)
    })
})
