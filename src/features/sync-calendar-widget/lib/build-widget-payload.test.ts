import {
    DONE_STATUS_ID,
    TODO_STATUS_ID,
    defaultTaskStatuses,
} from '@/shared/api'
import type { Task } from '@/shared/api'
import type {
    CalendarEvent,
    CalendarSettings,
} from '@/shared/api/calendar/model'
import { emptyEvent } from '@/entities/calendar-event'

import { buildCalendarWidgetPayload } from './build-widget-payload'

const today = '2026-10-14'
const settings: CalendarSettings = { showTasks: true, showHabits: true }

describe('buildCalendarWidgetPayload', () => {
    it('includes an event occurring today', () => {
        const event: CalendarEvent = {
            ...emptyEvent(today, 11 * 60),
            id: 'e1',
            title: 'Созвон',
            color: '#6875E8',
        }

        const items = buildCalendarWidgetPayload(
            [event],
            [],
            [],
            today,
            settings,
            { taskStatuses: [], taskCompletions: [], habitCompletions: [] },
        )

        expect(items).toEqual([
            expect.objectContaining({
                title: 'Созвон',
                date: today,
                startMinute: 11 * 60,
                color: '#6875E8',
                useAppAccent: false,
                completed: false,
            }),
        ])
    })

    it('includes a dated task with its own time, flagged completed when done', () => {
        const task: Task = {
            id: 't1',
            title: 'Сдать отчёт',
            statusId: DONE_STATUS_ID,
            startDate: today,
            endDate: today,
            startMinute: 18 * 60,
            createdAt: `${today}T00:00:00.000Z`,
            updatedAt: `${today}T00:00:00.000Z`,
        }

        const items = buildCalendarWidgetPayload(
            [],
            [task],
            [],
            today,
            settings,
            {
                taskStatuses: defaultTaskStatuses,
                taskCompletions: [],
                habitCompletions: [],
            },
        )

        expect(items).toEqual([
            expect.objectContaining({
                title: 'Сдать отчёт',
                startMinute: 18 * 60,
                useAppAccent: true,
                completed: true,
            }),
        ])
    })

    it('excludes tasks when showTasks is off', () => {
        const task: Task = {
            id: 't1',
            title: 'Сдать отчёт',
            statusId: TODO_STATUS_ID,
            startDate: today,
            endDate: today,
            createdAt: `${today}T00:00:00.000Z`,
            updatedAt: `${today}T00:00:00.000Z`,
        }

        const items = buildCalendarWidgetPayload(
            [],
            [task],
            [],
            today,
            { showTasks: false, showHabits: true },
            { taskStatuses: [], taskCompletions: [], habitCompletions: [] },
        )

        expect(items).toEqual([])
    })

    it('spans the whole sync window, carrying each occurrence on its own date', () => {
        const event: CalendarEvent = {
            ...emptyEvent(today, 9 * 60),
            id: 'e1',
            title: 'Ежедневная зарядка',
            repeat: { type: 'daily' },
        }

        const items = buildCalendarWidgetPayload(
            [event],
            [],
            [],
            today,
            settings,
            { taskStatuses: [], taskCompletions: [], habitCompletions: [] },
        )

        expect(items.map((item) => item.date)).toEqual([
            '2026-10-14',
            '2026-10-15',
            '2026-10-16',
            '2026-10-17',
            '2026-10-18',
            '2026-10-19',
            '2026-10-20',
        ])
    })
})
