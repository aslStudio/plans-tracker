import {
    DONE_STATUS_ID,
    TODO_STATUS_ID,
    defaultNotificationSettings,
    defaultTaskStatuses,
    type Habit,
    type NotificationSettings,
    type Task,
} from '@/shared/api'
import type { CalendarEvent } from '@/shared/api/calendar/model'

import {
    planCalendarNotifications,
    planHabitNotifications,
    planTaskNotifications,
} from './schedule-plan'

const TODAY = '2026-10-14'
const BEFORE_TEN = new Date(2026, 9, 14, 9, 0)
const AFTER_TEN = new Date(2026, 9, 14, 10, 30)

const settings: NotificationSettings = {
    ...defaultNotificationSettings,
    enabled: true,
}

function makeTask(overrides: Partial<Task>): Task {
    return {
        id: 'task-1',
        title: 'Task',
        statusId: TODO_STATUS_ID,
        priorityId: null,
        startDate: null,
        endDate: null,
        repeat: null,
        createdAt: TODAY,
        updatedAt: TODAY,
        ...overrides,
    }
}

describe('planTaskNotifications', () => {
    it("schedules tasks-empty-day at 10:00 when today's list is empty", () => {
        const plans = planTaskNotifications(
            settings,
            { tasks: [], statuses: defaultTaskStatuses, completions: [] },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'tasks-empty-day',
                date: new Date(2026, 9, 14, 10, 0),
            }),
        )
    })

    it('does not schedule tasks-empty-day once 10:00 already passed', () => {
        const plans = planTaskNotifications(
            settings,
            { tasks: [], statuses: defaultTaskStatuses, completions: [] },
            TODAY,
            AFTER_TEN,
        )
        expect(plans.find((p) => p.id === 'tasks-empty-day')).toBeUndefined()
    })

    it('does not schedule tasks-empty-day when a task exists today', () => {
        const task = makeTask({ startDate: TODAY, endDate: TODAY })
        const plans = planTaskNotifications(
            settings,
            { tasks: [task], statuses: defaultTaskStatuses, completions: [] },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans.find((p) => p.id === 'tasks-empty-day')).toBeUndefined()
    })

    it('schedules tasks-overdue at 10:00 when today has tasks', () => {
        const todayTask = makeTask({
            id: 'today-task',
            startDate: TODAY,
            endDate: TODAY,
        })
        const overdueTask = makeTask({
            id: 'overdue-task',
            startDate: '2026-10-10',
            endDate: '2026-10-10',
        })
        const plans = planTaskNotifications(
            settings,
            {
                tasks: [todayTask, overdueTask],
                statuses: defaultTaskStatuses,
                completions: [],
            },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'tasks-overdue',
                date: new Date(2026, 9, 14, 10, 0),
            }),
        )
    })

    it("schedules tasks-overdue at 11:00 when today's list is otherwise empty", () => {
        const overdueTask = makeTask({
            id: 'overdue-task',
            startDate: '2026-10-10',
            endDate: '2026-10-10',
        })
        const plans = planTaskNotifications(
            settings,
            {
                tasks: [overdueTask],
                statuses: defaultTaskStatuses,
                completions: [],
            },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'tasks-overdue',
                date: new Date(2026, 9, 14, 11, 0),
            }),
        )
    })

    it('does not schedule tasks-overdue when nothing is overdue', () => {
        const plans = planTaskNotifications(
            settings,
            { tasks: [], statuses: defaultTaskStatuses, completions: [] },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans.find((p) => p.id === 'tasks-overdue')).toBeUndefined()
    })

    it('schedules tasks-end-of-day at 18:00 only while something is still open', () => {
        const openTask = makeTask({ startDate: TODAY, endDate: TODAY })
        const plans = planTaskNotifications(
            settings,
            {
                tasks: [openTask],
                statuses: defaultTaskStatuses,
                completions: [],
            },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'tasks-end-of-day',
                date: new Date(2026, 9, 14, 18, 0),
            }),
        )

        const doneTask = makeTask({
            startDate: TODAY,
            endDate: TODAY,
            statusId: DONE_STATUS_ID,
        })
        const plansWhenDone = planTaskNotifications(
            settings,
            {
                tasks: [doneTask],
                statuses: defaultTaskStatuses,
                completions: [],
            },
            TODAY,
            BEFORE_TEN,
        )
        expect(
            plansWhenDone.find((p) => p.id === 'tasks-end-of-day'),
        ).toBeUndefined()
    })

    it('respects disabled toggles', () => {
        const plans = planTaskNotifications(
            { ...settings, tasksEmptyDay: false },
            { tasks: [], statuses: defaultTaskStatuses, completions: [] },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans.find((p) => p.id === 'tasks-empty-day')).toBeUndefined()
    })
})

function makeHabit(overrides: Partial<Habit>): Habit {
    return {
        id: 'habit-1',
        title: 'Habit',
        repeat: { type: 'daily' },
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
        ...overrides,
    }
}

describe('planHabitNotifications', () => {
    it('schedules habits-half-day at 12:00 when nothing is done yet', () => {
        const plans = planHabitNotifications(
            settings,
            { habits: [makeHabit({})], completionsByHabitId: {} },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'habits-half-day',
                date: new Date(2026, 9, 14, 12, 0),
            }),
        )
    })

    it('schedules habits-end-of-day and streak notifications while incomplete', () => {
        const plans = planHabitNotifications(
            settings,
            { habits: [makeHabit({})], completionsByHabitId: {} },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({ id: 'habits-end-of-day' }),
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'streak-at-risk',
                date: new Date(2026, 9, 14, 20, 0),
            }),
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: 'streak-broken',
                date: new Date(2026, 9, 15, 0, 0),
            }),
        )
    })

    it('schedules nothing once every habit due today is completed', () => {
        const habit = makeHabit({})
        const plans = planHabitNotifications(
            settings,
            {
                habits: [habit],
                completionsByHabitId: {
                    [habit.id]: [
                        {
                            id: 'c1',
                            habitId: habit.id,
                            occurrenceDate: TODAY,
                            completedAt: TODAY,
                        },
                    ],
                },
            },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toEqual([])
    })

    it('schedules nothing when no habit is due today', () => {
        const plans = planHabitNotifications(
            settings,
            { habits: [], completionsByHabitId: {} },
            TODAY,
            BEFORE_TEN,
        )
        expect(plans).toEqual([])
    })
})

function makeEvent(overrides: Partial<CalendarEvent>): CalendarEvent {
    return {
        id: 'event-1',
        title: 'Event',
        date: TODAY,
        startMinute: 600, // 10:00
        duration: 30,
        allDay: false,
        color: '#000000',
        notes: '',
        location: '',
        repeat: null,
        until: null,
        excludedDates: [],
        link: null,
        ...overrides,
    }
}

describe('planCalendarNotifications', () => {
    it('schedules a reminder 15 minutes before and one at start', () => {
        const plans = planCalendarNotifications(
            settings,
            { events: [makeEvent({})] },
            TODAY,
            BEFORE_TEN,
            0,
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: `calendar-upcoming:event-1:${TODAY}`,
                date: new Date(2026, 9, 14, 9, 45),
            }),
        )
        expect(plans).toContainEqual(
            expect.objectContaining({
                id: `calendar-start:event-1:${TODAY}`,
                date: new Date(2026, 9, 14, 10, 0),
            }),
        )
    })

    it('expands a daily-repeating event across the lookahead window', () => {
        const event = makeEvent({ repeat: { type: 'daily' } })
        const plans = planCalendarNotifications(
            settings,
            { events: [event] },
            TODAY,
            BEFORE_TEN,
            2,
        )
        const starts = plans.filter((p) => p.id.startsWith('calendar-start:'))
        expect(starts).toHaveLength(3)
    })

    it('drops occurrences whose start time already passed', () => {
        const plans = planCalendarNotifications(
            settings,
            { events: [makeEvent({})] },
            TODAY,
            AFTER_TEN,
            0,
        )
        expect(plans).toEqual([])
    })

    it('respects independent toggles for upcoming vs start', () => {
        const plans = planCalendarNotifications(
            { ...settings, calendarUpcoming: false },
            { events: [makeEvent({})] },
            TODAY,
            BEFORE_TEN,
            0,
        )
        expect(plans).toHaveLength(1)
        expect(plans[0].id).toBe(`calendar-start:event-1:${TODAY}`)
    })
})
