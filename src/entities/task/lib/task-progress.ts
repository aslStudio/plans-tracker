import type { Task, TaskCompletion, TaskStatus } from '@/shared/api'
import {
    isTaskCompleted,
    tasksOnDate,
    type GroupedTasks,
    type TaskOccurrence,
} from './task-grouping'

function completedOccurrence(
    task: TaskOccurrence,
    date: string,
    completions: TaskCompletion[],
) {
    return completions.some(
        (item) => item.taskId === task.id && item.occurrenceDate === date,
    )
}

export function computeTaskProgress(
    groups: GroupedTasks,
    statuses: TaskStatus[],
    completions: TaskCompletion[],
    today: string,
) {
    const base = new Map<string, TaskOccurrence>()
    for (const task of groups.overdue)
        base.set(`${task.id}:${task.occurrenceDate ?? 'overdue'}`, task)
    for (const task of groups.today) {
        if (task.repeat) {
            if (task.occurrenceDate === today)
                base.set(`${task.id}:${today}`, task)
            continue
        }
        const start = task.startDate ?? task.endDate
        const end = task.endDate ?? task.startDate
        if (start && end && start <= today && today <= end)
            base.set(`${task.id}:today`, task)
    }
    const total = base.size
    let done = 0
    for (const task of base.values()) {
        if (task.repeat) {
            if (
                completedOccurrence(
                    task,
                    task.occurrenceDate ?? today,
                    completions,
                )
            )
                done += 1
        } else if (isTaskCompleted(task, statuses)) done += 1
    }

    const percentage = total > 0 ? Math.round((done / total) * 100) : 0
    return { done, total, percentage }
}

export type TaskDayProgress = {
    date: string
    done: number
    total: number
    percentage: number
    isComplete: boolean
}

/** `done`/`total` among tasks due on exactly `date` (via `tasksOnDate`). Mirrors `getHabitDayProgress`'s per-day shape for the task-completion chart. */
export function getTaskDayProgress(
    tasks: Task[],
    statuses: TaskStatus[],
    completions: TaskCompletion[],
    date: string,
): TaskDayProgress {
    const due = tasksOnDate(tasks, date)
    let done = 0
    for (const task of due) {
        if (task.repeat) {
            if (
                completedOccurrence(
                    task,
                    task.occurrenceDate ?? date,
                    completions,
                )
            )
                done += 1
        } else if (isTaskCompleted(task, statuses)) done += 1
    }
    return {
        date,
        done,
        total: due.length,
        percentage:
            due.length === 0 ? 0 : Math.round((done / due.length) * 100),
        isComplete: due.length > 0 && done === due.length,
    }
}
