import {
    agendaForDate,
    unplannedForDate,
    minuteAtDrop,
    draftFromUnplanned,
    emptyEvent,
    eventOnDate,
    layoutEvents,
    occursOn,
    parseTime,
    validateEvent,
    type AgendaItem,
} from './planner'
import type { Task } from '@/shared/api'

const date = '2026-10-13'
const event = { ...emptyEvent(date), id: 'event', title: 'План' }
const task: Task = {
    id: 'task',
    title: 'Задача',
    startDate: date,
    endDate: date,
    statusId: 'status-todo',
    createdAt: date,
    updatedAt: date,
    startMinute: 615,
    durationMinutes: 45,
}

describe('calendar planning', () => {
    it('validates minute precision and impossible dates', () => {
        expect(parseTime('09:17')).toBe(557)
        expect(parseTime('24:00')).toBeNull()
        expect(validateEvent({ ...event, date: '2026-02-30' })).toBeTruthy()
        expect(
            validateEvent({ ...event, startMinute: 1435, duration: 10 }),
        ).toBeTruthy()
        expect(validateEvent({ ...event, duration: 0 })).toBeTruthy()
        expect(validateEvent(event)).toBeNull()
    })
    it('respects recurrence boundaries, exceptions and weekly selections', () => {
        const recurring = {
            ...event,
            repeat: { type: 'daily' } as const,
            until: '2026-10-16',
            excludedDates: ['2026-10-14'],
        }
        expect(eventOnDate(recurring, '2026-10-12')).toBe(false)
        expect(eventOnDate(recurring, '2026-10-14')).toBe(false)
        expect(eventOnDate(recurring, '2026-10-16')).toBe(true)
        expect(eventOnDate(recurring, '2026-10-17')).toBe(false)
        expect(
            occursOn(
                date,
                { type: 'weekly', daysOfWeek: [2, 4] },
                '2026-10-15',
            ),
        ).toBe(true)
        expect(
            occursOn(
                date,
                { type: 'weekly', daysOfWeek: [2, 4] },
                '2026-10-16',
            ),
        ).toBe(false)
    })
    it('handles leap days and intervals across daylight saving dates', () => {
        expect(
            occursOn(
                '2024-01-29',
                { type: 'monthly', dayOfMonth: 29 },
                '2024-02-29',
            ),
        ).toBe(true)
        expect(
            occursOn(
                '2026-03-07',
                { type: 'custom', everyNDays: 2 },
                '2026-03-09',
            ),
        ).toBe(true)
    })
    it('projects only opted-in tasks and keeps dated untimed tasks in the tray', () => {
        expect(agendaForDate([], [task], [], date)[0]).toMatchObject({
            startMinute: 615,
            duration: 45,
            allDay: false,
            source: 'task',
        })
        expect(
            agendaForDate([], [{ ...task, startMinute: null }], [], date),
        ).toEqual([])
        expect(
            unplannedForDate([], [{ ...task, startMinute: null }], [], date),
        ).toHaveLength(1)
        expect(agendaForDate([], [task], [], date, false)).toEqual([])
    })
    it('uses current linked titles without duplicating tasks', () => {
        expect(
            agendaForDate(
                [{ ...event, link: { type: 'task', id: task.id } }],
                [task],
                [],
                date,
            ),
        ).toHaveLength(1)
        expect(
            agendaForDate(
                [{ ...event, link: { type: 'task', id: task.id } }],
                [task],
                [],
                date,
            )[0].title,
        ).toBe(task.title)
    })
    it('marks completed task and habit occurrences for the selected date', () => {
        const linkedTask = { ...task, repeat: { type: 'daily' } as const }
        const linkedHabit = {
            id: 'habit',
            title: 'Чтение',
            repeat: { type: 'daily' } as const,
            createdAt: date,
            updatedAt: date,
        }
        const completedItems = agendaForDate(
            [
                {
                    ...event,
                    id: 'task-event',
                    link: { type: 'task', id: linkedTask.id },
                },
                {
                    ...event,
                    id: 'habit-event',
                    link: { type: 'habit', id: linkedHabit.id },
                },
            ],
            [linkedTask],
            [linkedHabit],
            date,
            true,
            true,
            {
                taskCompletions: [
                    {
                        id: 'task-done',
                        taskId: linkedTask.id,
                        occurrenceDate: date,
                        completedAt: date,
                    },
                ],
                habitCompletions: [
                    {
                        id: 'habit-done',
                        habitId: linkedHabit.id,
                        occurrenceDate: date,
                        completedAt: date,
                    },
                ],
            },
        )
        expect(completedItems.map((item) => item.completed)).toEqual([
            true,
            true,
        ])
    })
    it('assigns separate columns to overlapping events and resets after a group', () => {
        const items: AgendaItem[] = [
            {
                ...event,
                id: 'a',
                source: 'event',
                startMinute: 540,
                duration: 60,
            },
            {
                ...event,
                id: 'b',
                source: 'event',
                startMinute: 570,
                duration: 60,
            },
            {
                ...event,
                id: 'c',
                source: 'event',
                startMinute: 630,
                duration: 60,
            },
        ]
        expect(layoutEvents(items).map((e) => [e.column, e.columns])).toEqual([
            [0, 2],
            [1, 2],
            [0, 1],
        ])
    })
})

describe('calendar assignment and drag targets', () => {
    const habit = {
        id: 'habit',
        title: 'Чтение',
        repeat: { type: 'daily' } as const,
        createdAt: '2026-10-01T09:00:00Z',
        updatedAt: '2026-10-01T09:00:00Z',
    }
    it('keeps unbound habits out of scheduled days and shows them in the unplanned tray', () => {
        expect(agendaForDate([], [], [habit], date)).toEqual([])
        expect(
            unplannedForDate(
                [],
                [
                    {
                        ...task,
                        startDate: null,
                        endDate: null,
                        startMinute: null,
                    },
                ],
                [habit],
                date,
            ).map((i) => i.source),
        ).toEqual(['task', 'habit'])
        expect(unplannedForDate([], [task], [], date)).toEqual([])
    })
    it('projects opted-in recurring habits and excludes them from the tray', () => {
        const scheduled = {
            ...habit,
            startMinute: 600,
            durationMinutes: 30,
            repeat: { type: 'weekly' as const, daysOfWeek: [2 as const] },
        }
        expect(agendaForDate([], [], [scheduled], date)[0]).toMatchObject({
            source: 'habit',
            startMinute: 600,
            duration: 30,
        })
        expect(unplannedForDate([], [], [scheduled], date)).toEqual([])
        expect(agendaForDate([], [], [scheduled], '2026-10-14')).toEqual([])
        expect(agendaForDate([], [], [scheduled], '2026-10-20')).toHaveLength(1)
        expect(
            agendaForDate(
                [{ ...event, link: { type: 'habit', id: habit.id } }],
                [],
                [scheduled],
                date,
            ),
        ).toHaveLength(1)
        expect(
            unplannedForDate(
                [],
                [],
                [{ ...scheduled, startMinute: null }],
                date,
            ),
        ).toHaveLength(1)
    })
    it('removes an item from the tray only when an occurrence is actually scheduled', () => {
        const scheduled = {
            ...event,
            link: { type: 'habit' as const, id: habit.id },
        }
        expect(unplannedForDate([scheduled], [], [habit], date)).toEqual([])
        expect(
            unplannedForDate([scheduled], [], [habit], '2026-10-14'),
        ).toHaveLength(1)
        expect(
            agendaForDate([scheduled], [], [habit], date, true, false),
        ).toEqual([])
    })
    it('lays out full-day cards beside overlapping timed events', () => {
        const result = layoutEvents([
            { ...event, source: 'event', id: 'all', allDay: true },
            {
                ...event,
                source: 'event',
                id: 'timed',
                startMinute: 600,
                duration: 60,
            },
        ])
        expect(result[0]).toMatchObject({
            column: 0,
            columns: 2,
            event: { startMinute: 0, duration: 1440 },
        })
        expect(result[1]).toMatchObject({ column: 1, columns: 2 })
    })
    it('translates a scrolled drop to quarter-hour time and rejects outside drops', () => {
        const viewport = { x: 0, y: 300, width: 400, height: 500 }
        expect(minuteAtDrop(160, 352, viewport, 608, 76)).toBe(510)
        expect(minuteAtDrop(30, 352, viewport, 608, 76)).toBeNull()
        expect(minuteAtDrop(160, 299, viewport, 608, 76)).toBeNull()
        expect(minuteAtDrop(160, 802, viewport, 608, 76)).toBeNull()
        expect(minuteAtDrop(160, 790, viewport, 1800, 76)).toBe(1425)
    })
    it('prefills the entity link and recurrence while keeping late-night duration valid', () => {
        const item = unplannedForDate([], [], [habit], date)[0]
        const draft = draftFromUnplanned(item, date, 1425)
        expect(draft).toMatchObject({
            id: '',
            date,
            startMinute: 1425,
            duration: 15,
            allDay: false,
            link: { type: 'habit', id: habit.id },
            repeat: { type: 'daily' },
        })
        expect(validateEvent(draft)).toBeNull()
    })
})
