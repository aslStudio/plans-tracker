import {
    DONE_STATUS_ID,
    defaultTaskStatuses,
    TODO_STATUS_ID,
} from '@/shared/api'
import { addDays } from '@/shared/lib/date'
import { groupTasksByDay } from './task-grouping'
import { computeTaskProgress, getTaskDayProgress } from './task-progress'

const today = '2026-10-12'
const tomorrow = addDays(today, 1)
const stamp = '2026-10-12T08:00:00.000Z'

function task(id: string, date: string, statusId = TODO_STATUS_ID) {
    return {
        id,
        title: id,
        statusId,
        startDate: date,
        endDate: date,
        createdAt: stamp,
        updatedAt: stamp,
    }
}

describe('computeTaskProgress', () => {
    it('keeps tomorrow completions out of today progress', () => {
        const tasks = [
            ...Array.from({ length: 10 }, (_, index) =>
                task(`today-${index}`, today, DONE_STATUS_ID),
            ),
            task('tomorrow-done', tomorrow, DONE_STATUS_ID),
        ]
        const groups = groupTasksByDay(tasks, defaultTaskStatuses, today, 1)

        expect(
            computeTaskProgress(groups, defaultTaskStatuses, [], today),
        ).toEqual({
            done: 10,
            total: 10,
            percentage: 100,
        })
    })

    it('counts an early one-off completion only on its scheduled day', () => {
        const tasks = [
            task('today', today),
            task('tomorrow', tomorrow, DONE_STATUS_ID),
        ]
        expect(
            computeTaskProgress(
                groupTasksByDay(tasks, defaultTaskStatuses, today, 7),
                defaultTaskStatuses,
                [],
                today,
            ),
        ).toEqual({ done: 0, total: 1, percentage: 0 })
        expect(
            getTaskDayProgress(tasks, defaultTaskStatuses, [], tomorrow),
        ).toMatchObject({ done: 1, total: 1, percentage: 100 })
    })

    it('does not count a future recurring occurrence as completed today', () => {
        const tasks = [
            { ...task('daily', today), repeat: { type: 'daily' as const } },
        ]
        const completions = [
            {
                id: 'early',
                taskId: 'daily',
                occurrenceDate: tomorrow,
                completedAt: stamp,
            },
        ]
        expect(
            computeTaskProgress(
                groupTasksByDay(
                    tasks,
                    defaultTaskStatuses,
                    today,
                    7,
                    completions,
                ),
                defaultTaskStatuses,
                completions,
                today,
            ),
        ).toEqual({ done: 0, total: 1, percentage: 0 })
        expect(
            getTaskDayProgress(
                tasks,
                defaultTaskStatuses,
                completions,
                tomorrow,
            ),
        ).toMatchObject({ done: 1, percentage: 100 })
    })

    it('includes every unfinished overdue task in the daily target', () => {
        const groups = groupTasksByDay(
            [task('late', addDays(today, -1)), task('today', today)],
            defaultTaskStatuses,
            today,
        )

        expect(
            computeTaskProgress(groups, defaultTaskStatuses, [], today).total,
        ).toBe(2)
    })
})

describe('getTaskDayProgress', () => {
    it('counts one-off tasks due on that date by current status', () => {
        const tasks = [
            task('a', today, DONE_STATUS_ID),
            task('b', today, TODO_STATUS_ID),
            task('c', tomorrow, DONE_STATUS_ID),
        ]

        expect(
            getTaskDayProgress(tasks, defaultTaskStatuses, [], today),
        ).toEqual({
            date: today,
            done: 1,
            total: 2,
            percentage: 50,
            isComplete: false,
        })
    })

    it('counts a recurring task on that date by its occurrence completion', () => {
        const tasks = [
            {
                id: 'daily',
                title: 'daily',
                statusId: TODO_STATUS_ID,
                repeat: { type: 'daily' as const },
                startDate: today,
                createdAt: stamp,
                updatedAt: stamp,
            },
        ]

        expect(
            getTaskDayProgress(tasks, defaultTaskStatuses, [], today).done,
        ).toBe(0)
        expect(
            getTaskDayProgress(
                tasks,
                defaultTaskStatuses,
                [
                    {
                        id: 'c1',
                        taskId: 'daily',
                        occurrenceDate: today,
                        completedAt: stamp,
                    },
                ],
                today,
            ).done,
        ).toBe(1)
    })

    it('ignores backlog tasks with no date', () => {
        const tasks = [
            {
                id: 'backlog',
                title: 'backlog',
                statusId: TODO_STATUS_ID,
                createdAt: stamp,
                updatedAt: stamp,
            },
        ]

        expect(
            getTaskDayProgress(tasks, defaultTaskStatuses, [], today).total,
        ).toBe(0)
    })
})
