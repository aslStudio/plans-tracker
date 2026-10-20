import {
    TODO_STATUS_ID,
    defaultTaskPriorities,
    defaultTaskStatuses,
} from '@/shared/api'
import type { Task } from '@/shared/api'

import {
    hasAnyDateData,
    hasAnyPriorityData,
    nextSortOnFieldPress,
    sortTasks,
} from './task-sort'

function makeTask(overrides: Partial<Task>): Task {
    return {
        id: 'task-1',
        title: 'Task',
        statusId: TODO_STATUS_ID,
        priorityId: null,
        startDate: null,
        endDate: null,
        repeat: null,
        createdAt: '2026-10-12T00:00:00.000Z',
        updatedAt: '2026-10-12T00:00:00.000Z',
        ...overrides,
    }
}

const [lowPriority, mediumPriority, highPriority] = defaultTaskPriorities

describe('sortTasks', () => {
    it('sorts by status order, ascending', () => {
        const todo = makeTask({ id: 'todo', statusId: 'status-todo' })
        const done = makeTask({ id: 'done', statusId: 'status-done' })

        const sorted = sortTasks(
            [done, todo],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'status',
                direction: 'asc',
            },
        )

        expect(sorted.map((t) => t.id)).toEqual(['todo', 'done'])
    })

    it('sorts by status order, descending', () => {
        const todo = makeTask({ id: 'todo', statusId: 'status-todo' })
        const done = makeTask({ id: 'done', statusId: 'status-done' })

        const sorted = sortTasks(
            [todo, done],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'status',
                direction: 'desc',
            },
        )

        expect(sorted.map((t) => t.id)).toEqual(['done', 'todo'])
    })

    it('sorts by creation date', () => {
        const older = makeTask({
            id: 'older',
            createdAt: '2026-10-01T00:00:00.000Z',
        })
        const newer = makeTask({
            id: 'newer',
            createdAt: '2026-10-10T00:00:00.000Z',
        })

        const newestFirst = sortTasks(
            [older, newer],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'createdAt',
                direction: 'desc',
            },
        )
        expect(newestFirst.map((t) => t.id)).toEqual(['newer', 'older'])

        const oldestFirst = sortTasks(
            [older, newer],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'createdAt',
                direction: 'asc',
            },
        )
        expect(oldestFirst.map((t) => t.id)).toEqual(['older', 'newer'])
    })

    it('sorts by end date, soonest first', () => {
        const soon = makeTask({
            id: 'soon',
            startDate: '2026-10-13',
            endDate: '2026-10-13',
        })
        const later = makeTask({
            id: 'later',
            startDate: '2026-10-20',
            endDate: '2026-10-20',
        })

        const sorted = sortTasks(
            [later, soon],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'deadline',
                direction: 'asc',
            },
        )

        expect(sorted.map((t) => t.id)).toEqual(['soon', 'later'])
    })

    it('for a range, sorts by the end date, not the start date', () => {
        // Starts later but ends sooner than the other — end date should win.
        const endsEarlier = makeTask({
            id: 'ends-earlier',
            startDate: '2026-10-14',
            endDate: '2026-10-15',
        })
        const endsLater = makeTask({
            id: 'ends-later',
            startDate: '2026-10-10',
            endDate: '2026-10-20',
        })

        const sorted = sortTasks(
            [endsLater, endsEarlier],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'deadline',
                direction: 'asc',
            },
        )

        expect(sorted.map((t) => t.id)).toEqual(['ends-earlier', 'ends-later'])
    })

    it('always sorts a missing date last, regardless of direction', () => {
        const noDate = makeTask({ id: 'none', startDate: null, endDate: null })
        const withDate = makeTask({
            id: 'has-one',
            startDate: '2026-10-13',
            endDate: '2026-10-13',
        })

        const asc = sortTasks(
            [noDate, withDate],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'deadline',
                direction: 'asc',
            },
        )
        expect(asc.map((t) => t.id)).toEqual(['has-one', 'none'])

        const desc = sortTasks(
            [noDate, withDate],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'deadline',
                direction: 'desc',
            },
        )
        expect(desc.map((t) => t.id)).toEqual(['has-one', 'none'])
    })

    it('sorts by priority order, ascending (low to high)', () => {
        const high = makeTask({ id: 'high', priorityId: highPriority.id })
        const low = makeTask({ id: 'low', priorityId: lowPriority.id })
        const medium = makeTask({ id: 'medium', priorityId: mediumPriority.id })

        const sorted = sortTasks(
            [high, low, medium],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'priority',
                direction: 'asc',
            },
        )

        expect(sorted.map((t) => t.id)).toEqual(['low', 'medium', 'high'])
    })

    it('sorts by priority order, descending (high to low)', () => {
        const high = makeTask({ id: 'high', priorityId: highPriority.id })
        const low = makeTask({ id: 'low', priorityId: lowPriority.id })

        const sorted = sortTasks(
            [low, high],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'priority',
                direction: 'desc',
            },
        )

        expect(sorted.map((t) => t.id)).toEqual(['high', 'low'])
    })

    it('always sorts a missing priority last, regardless of direction', () => {
        const none = makeTask({ id: 'none', priorityId: null })
        const withPriority = makeTask({
            id: 'has-one',
            priorityId: lowPriority.id,
        })

        const asc = sortTasks(
            [none, withPriority],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'priority',
                direction: 'asc',
            },
        )
        expect(asc.map((t) => t.id)).toEqual(['has-one', 'none'])

        const desc = sortTasks(
            [none, withPriority],
            defaultTaskStatuses,
            defaultTaskPriorities,
            {
                field: 'priority',
                direction: 'desc',
            },
        )
        expect(desc.map((t) => t.id)).toEqual(['has-one', 'none'])
    })

    it('does not mutate the input array', () => {
        const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })]
        const original = [...tasks]

        sortTasks(tasks, defaultTaskStatuses, defaultTaskPriorities, {
            field: 'createdAt',
            direction: 'desc',
        })

        expect(tasks).toEqual(original)
    })
})

describe('nextSortOnFieldPress', () => {
    it('flips the direction when pressing the already-active field', () => {
        const current = { field: 'status' as const, direction: 'asc' as const }

        expect(nextSortOnFieldPress(current, 'status')).toEqual({
            field: 'status',
            direction: 'desc',
        })
        expect(
            nextSortOnFieldPress(
                { field: 'status', direction: 'desc' },
                'status',
            ),
        ).toEqual({
            field: 'status',
            direction: 'asc',
        })
    })

    it('switches to a different field starting ascending', () => {
        const current = { field: 'status' as const, direction: 'desc' as const }

        expect(nextSortOnFieldPress(current, 'createdAt')).toEqual({
            field: 'createdAt',
            direction: 'asc',
        })
    })
})

describe('hasAnyDateData', () => {
    it('is false when no task has a date', () => {
        expect(hasAnyDateData([makeTask({})])).toBe(false)
    })

    it('is true once at least one task has a start or end date', () => {
        expect(
            hasAnyDateData([
                makeTask({}),
                makeTask({ startDate: '2026-10-13' }),
            ]),
        ).toBe(true)
        expect(hasAnyDateData([makeTask({ endDate: '2026-10-13' })])).toBe(true)
    })
})

describe('hasAnyPriorityData', () => {
    it('is false when no task has a priority', () => {
        expect(hasAnyPriorityData([makeTask({})])).toBe(false)
    })

    it('is true once at least one task has a priority set', () => {
        expect(
            hasAnyPriorityData([
                makeTask({}),
                makeTask({ priorityId: lowPriority.id }),
            ]),
        ).toBe(true)
    })
})
