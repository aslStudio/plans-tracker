import {
    DONE_STATUS_ID,
    TODO_STATUS_ID,
    defaultTaskStatuses,
} from '@/shared/api'
import type { Task } from '@/shared/api'
import { addDays } from '@/shared/lib/date'

import {
    groupTasksByDay,
    isTaskOverdue,
    resolveDateLineText,
    resolveTaskDays,
    tasksOnDate,
} from './task-grouping'

const TODAY = '2026-10-12'
const TOMORROW = '2026-10-13'
const YESTERDAY = '2026-10-11'
const IN_FIVE_DAYS = '2026-10-17'

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

/** A plain one-day task — the default shape, start and end are the same date. */
function oneDayTask(overrides: Partial<Task> & { date: string | null }): Task {
    const { date, ...rest } = overrides
    return makeTask({ startDate: date, endDate: date, ...rest })
}

describe('resolveTaskDays', () => {
    it('places a task with no date in backlog only', () => {
        const task = oneDayTask({ date: null })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['backlog'])
    })

    it('places a plain one-day task due today in today only', () => {
        const task = oneDayTask({ date: TODAY })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['today'])
    })

    it('places an active, uncompleted overdue one-day task in overdue only', () => {
        const task = oneDayTask({ date: YESTERDAY, statusId: TODO_STATUS_ID })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['overdue'])
    })

    it('excludes a completed past task from current day groups', () => {
        const task = oneDayTask({ date: YESTERDAY, statusId: DONE_STATUS_ID })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual([])
    })

    it('does not place a plain one-day task due tomorrow in today too', () => {
        const task = oneDayTask({ date: TOMORROW })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['tomorrow'])
    })

    it('does not place a plain one-day task due later than tomorrow anywhere', () => {
        const task = oneDayTask({ date: IN_FIVE_DAYS })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual([])
    })

    it('places a completed one-day task due tomorrow or later in tomorrow only', () => {
        const dueTomorrow = oneDayTask({
            date: TOMORROW,
            statusId: DONE_STATUS_ID,
        })
        const dueLater = oneDayTask({
            date: IN_FIVE_DAYS,
            statusId: DONE_STATUS_ID,
        })
        expect(
            resolveTaskDays(dueTomorrow, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['tomorrow'])
        expect(
            resolveTaskDays(dueLater, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['tomorrow'])
    })

    it('places an explicitly ranged task spanning today and tomorrow in both', () => {
        const task = makeTask({ startDate: TODAY, endDate: TOMORROW })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['today', 'tomorrow'])
    })

    it('places a ranged task spanning several days through both shown day cards', () => {
        const task = makeTask({ startDate: YESTERDAY, endDate: IN_FIVE_DAYS })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['today', 'tomorrow'])
    })

    it('places a ranged task entirely in the past (end before today) in overdue, not today/tomorrow', () => {
        const task = makeTask({ startDate: '2026-10-05', endDate: YESTERDAY })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual(['overdue'])
    })

    it('does not place a ranged task that starts after tomorrow anywhere yet', () => {
        const task = makeTask({
            startDate: IN_FIVE_DAYS,
            endDate: '2026-10-20',
        })
        expect(
            resolveTaskDays(task, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual([])
    })
})

describe('isTaskOverdue', () => {
    it('is true for a past end date that is not completed', () => {
        const task = oneDayTask({ date: YESTERDAY, statusId: TODO_STATUS_ID })
        expect(isTaskOverdue(task, defaultTaskStatuses, TODAY)).toBe(true)
    })

    it('is false once the task is completed, even if the end date passed', () => {
        const task = oneDayTask({ date: YESTERDAY, statusId: DONE_STATUS_ID })
        expect(isTaskOverdue(task, defaultTaskStatuses, TODAY)).toBe(false)
    })

    it('is judged by endDate, not startDate — a range still running is not overdue', () => {
        const task = makeTask({ startDate: YESTERDAY, endDate: TOMORROW })
        expect(isTaskOverdue(task, defaultTaskStatuses, TODAY)).toBe(false)
    })

    it('is false for a one-day task due today or in the future', () => {
        expect(
            isTaskOverdue(
                oneDayTask({ date: TODAY }),
                defaultTaskStatuses,
                TODAY,
            ),
        ).toBe(false)
        expect(
            isTaskOverdue(
                oneDayTask({ date: TOMORROW }),
                defaultTaskStatuses,
                TODAY,
            ),
        ).toBe(false)
    })

    it('is false for a task with no date', () => {
        expect(
            isTaskOverdue(
                oneDayTask({ date: null }),
                defaultTaskStatuses,
                TODAY,
            ),
        ).toBe(false)
    })
})

describe('resolveDateLineText', () => {
    it('shows nothing for a task with no date', () => {
        expect(
            resolveDateLineText(oneDayTask({ date: null }), TODAY),
        ).toBeNull()
    })

    it("hides a one-day task's date when it matches the day it is placed under", () => {
        expect(
            resolveDateLineText(oneDayTask({ date: TODAY }), TODAY),
        ).toBeNull()
    })

    it("shows a one-day task's date when it does not match the day (an overdue carry-forward)", () => {
        expect(
            resolveDateLineText(oneDayTask({ date: YESTERDAY }), TODAY),
        ).toBe('11 окт')
    })

    it('always shows "start - end" for an explicit range, regardless of the day shown under', () => {
        const task = makeTask({ startDate: TODAY, endDate: TOMORROW })
        expect(resolveDateLineText(task, TODAY)).toBe('12 окт - 13 окт')
        expect(resolveDateLineText(task, TOMORROW)).toBe('12 окт - 13 окт')
    })
})

describe('groupTasksByDay', () => {
    it('splits one-day tasks between overdue/today/tomorrow/backlog', () => {
        const overdueTask = oneDayTask({ id: 'overdue-task', date: YESTERDAY })
        const todayTask = oneDayTask({ id: 'today-task', date: TODAY })
        const tomorrowTask = oneDayTask({ id: 'tomorrow-task', date: TOMORROW })
        const backlogTask = oneDayTask({ id: 'backlog-task', date: null })

        const groups = groupTasksByDay(
            [overdueTask, todayTask, tomorrowTask, backlogTask],
            defaultTaskStatuses,
            TODAY,
        )

        expect(groups.overdue.map((t) => t.id)).toEqual(['overdue-task'])
        expect(groups.today.map((t) => t.id)).toEqual(['today-task'])
        expect(groups.tomorrow.map((t) => t.id)).toEqual(['tomorrow-task'])
        expect(groups.backlog.map((t) => t.id)).toEqual(['backlog-task'])
    })

    it.each([
        { startDate: YESTERDAY, endDate: YESTERDAY },
        { startDate: '2026-10-10', endDate: null },
        { startDate: null, endDate: YESTERDAY },
        { startDate: '2026-10-05', endDate: YESTERDAY },
    ])('keeps completed past tasks out of current cards: %j', (dates) => {
        const done = makeTask({ ...dates, statusId: DONE_STATUS_ID })
        const groups = groupTasksByDay([done], defaultTaskStatuses, TODAY, 3)

        expect(groups).toEqual({
            overdue: [],
            today: [],
            tomorrow: [],
            future: [
                { date: addDays(TODAY, 2), tasks: [] },
                { date: addDays(TODAY, 3), tasks: [] },
            ],
            backlog: [],
        })
        expect(
            resolveTaskDays(done, defaultTaskStatuses, TODAY, TOMORROW),
        ).toEqual([])
        expect(tasksOnDate([done], dates.endDate ?? dates.startDate!)).toEqual([
            done,
        ])
    })

    it('stops showing a completed task in today after the day changes', () => {
        const done = oneDayTask({ date: TODAY, statusId: DONE_STATUS_ID })

        expect(
            groupTasksByDay([done], defaultTaskStatuses, TODAY).today,
        ).toEqual([done])
        expect(
            groupTasksByDay([done], defaultTaskStatuses, TOMORROW).today,
        ).toEqual([])
        expect(tasksOnDate([done], TODAY)).toEqual([done])
    })

    it('duplicates an explicitly ranged task into both today and tomorrow', () => {
        const ranged = makeTask({
            id: 'ranged',
            startDate: TODAY,
            endDate: IN_FIVE_DAYS,
        })

        const groups = groupTasksByDay([ranged], defaultTaskStatuses, TODAY)

        expect(groups.today.map((t) => t.id)).toEqual(['ranged'])
        expect(groups.tomorrow.map((t) => t.id)).toEqual(['ranged'])
    })

    it('does not duplicate a plain one-day task anywhere else', () => {
        const todayOnly = oneDayTask({ id: 'today-only', date: TODAY })

        const groups = groupTasksByDay([todayOnly], defaultTaskStatuses, TODAY)

        expect(groups.today.map((t) => t.id)).toEqual(['today-only'])
        expect(groups.tomorrow).toEqual([])
    })

    it('generates repeating occurrences for today and the configured future days', () => {
        const repeating = makeTask({
            id: 'daily',
            startDate: TODAY,
            endDate: TODAY,
            repeat: { type: 'daily' },
        })

        const groups = groupTasksByDay(
            [repeating],
            defaultTaskStatuses,
            TODAY,
            3,
        )

        expect(groups.today.map((task) => task.occurrenceDate)).toEqual([TODAY])
        expect(groups.tomorrow.map((task) => task.occurrenceDate)).toEqual([
            TOMORROW,
        ])
        expect(
            groups.future.map((day) => day.tasks[0]?.occurrenceDate),
        ).toEqual([addDays(TODAY, 2), addDays(TODAY, 3)])
    })

    it('keeps a missed recurring occurrence overdue until its occurrence is completed', () => {
        const repeating = makeTask({
            id: 'daily',
            startDate: YESTERDAY,
            endDate: YESTERDAY,
            repeat: { type: 'daily' },
        })

        const groups = groupTasksByDay(
            [repeating],
            defaultTaskStatuses,
            TODAY,
            1,
        )

        expect(groups.overdue[0]?.occurrenceDate).toBe(YESTERDAY)
        expect(groups.today[0]?.occurrenceDate).toBe(TODAY)
    })
})

describe('tasksOnDate', () => {
    it('ignores a task with no date at all', () => {
        expect(tasksOnDate([makeTask({})], TODAY)).toEqual([])
    })

    it('matches a plain one-day task only on its exact date', () => {
        const task = oneDayTask({ date: TODAY })
        expect(tasksOnDate([task], TODAY)).toEqual([task])
        expect(tasksOnDate([task], TOMORROW)).toEqual([])
    })

    it('matches a ranged task on every date within its span', () => {
        const task = makeTask({ startDate: TODAY, endDate: IN_FIVE_DAYS })
        expect(tasksOnDate([task], TODAY)).toEqual([task])
        expect(tasksOnDate([task], IN_FIVE_DAYS)).toEqual([task])
        expect(tasksOnDate([task], addDays(IN_FIVE_DAYS, 1))).toEqual([])
    })

    it('tags a recurring task with the queried occurrence date, on and only on its cadence', () => {
        const daily = makeTask({
            id: 'daily',
            startDate: TODAY,
            repeat: { type: 'daily' },
        })
        expect(tasksOnDate([daily], YESTERDAY)).toEqual([])
        expect(tasksOnDate([daily], TOMORROW)).toEqual([
            { ...daily, occurrenceDate: TOMORROW },
        ])
    })

    it('places an unfinished overdue task on its real past date, not on today', () => {
        const overdue = oneDayTask({ date: YESTERDAY })
        expect(tasksOnDate([overdue], YESTERDAY)).toEqual([overdue])
        expect(tasksOnDate([overdue], TODAY)).toEqual([])
    })
})
