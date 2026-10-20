import { t } from '@/shared/lib/i18n'
import type { Task, TaskPriority, TaskStatus } from '@/shared/api'

export type TaskSortField = 'status' | 'createdAt' | 'deadline' | 'priority'
export type TaskSortDirection = 'asc' | 'desc'
export type TaskSort = { field: TaskSortField; direction: TaskSortDirection }

/** Status-ascending by default — with the built-in statuses' `order` (todo=0, done=1), this alone reproduces "active first, done last" without a separate completed-sinks-last step. */
export const DEFAULT_TASK_SORT: TaskSort = { field: 'status', direction: 'asc' }

export const TASK_SORT_FIELDS: TaskSortField[] = [
    'status',
    'createdAt',
    'deadline',
    'priority',
]

export const TASK_SORT_FIELD_LABELS: Record<TaskSortField, string> = {
    get status() {
        return t('По статусу')
    },
    get createdAt() {
        return t('По дате создания')
    },
    get deadline() {
        return t('По дедлайну')
    },
    get priority() {
        return t('По приоритету')
    },
}

/** Tapping the already-active field flips its direction; tapping a different field switches to it, starting ascending. */
export function nextSortOnFieldPress(
    current: TaskSort,
    field: TaskSortField,
): TaskSort {
    if (current.field === field) {
        return {
            field,
            direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
    }
    return { field, direction: 'asc' }
}

/** "По дедлайну" is only worth offering once the date column is actually in use — otherwise every task would sort identically (missing dates always sort last) and the option would visibly do nothing. */
export function hasAnyDateData(tasks: Task[]): boolean {
    return tasks.some((task) => task.startDate || task.endDate)
}

/** Same reasoning as `hasAnyDateData` — "По приоритету" only makes sense once at least one task in the section actually has a priority set. */
export function hasAnyPriorityData(tasks: Task[]): boolean {
    return tasks.some((task) => task.priorityId)
}

/** Stable sort within a day section — doesn't change *which* section a task is in, only its order inside one. */
export function sortTasks(
    tasks: Task[],
    statuses: TaskStatus[],
    priorities: TaskPriority[],
    sort: TaskSort,
): Task[] {
    if (sort.field === 'status') {
        const order = new Map(
            statuses.map((status) => [status.id, status.order]),
        )
        const sorted = [...tasks]
        sorted.sort((a, b) => {
            const diff =
                (order.get(a.statusId) ?? 0) - (order.get(b.statusId) ?? 0)
            return sort.direction === 'asc' ? diff : -diff
        })
        return sorted
    }

    if (sort.field === 'createdAt') {
        const sorted = [...tasks]
        sorted.sort((a, b) => {
            const diff = a.createdAt.localeCompare(b.createdAt)
            return sort.direction === 'asc' ? diff : -diff
        })
        return sorted
    }

    if (sort.field === 'priority') {
        // A missing priority always sorts last, same reasoning as a missing deadline.
        const order = new Map(
            priorities.map((priority) => [priority.id, priority.order]),
        )
        const withPriority = tasks.filter(
            (task) => task.priorityId && order.has(task.priorityId),
        )
        const withoutPriority = tasks.filter(
            (task) => !task.priorityId || !order.has(task.priorityId),
        )
        withPriority.sort((a, b) => {
            const diff =
                (order.get(a.priorityId!) ?? 0) -
                (order.get(b.priorityId!) ?? 0)
            return sort.direction === 'asc' ? diff : -diff
        })
        return [...withPriority, ...withoutPriority]
    }

    // field === 'deadline' — judged by `endDate` (overdue is too), falling
    // back to `startDate` for a plain one-day task if only one is set. A
    // missing date always sorts last, it isn't "later" or "earlier" than a
    // real date, so direction never moves it.
    const endOf = (task: Task) => task.endDate ?? task.startDate ?? null
    const withDeadline = tasks.filter((task) => endOf(task))
    const withoutDeadline = tasks.filter((task) => !endOf(task))
    withDeadline.sort((a, b) => {
        const diff = endOf(a)!.localeCompare(endOf(b)!)
        return sort.direction === 'asc' ? diff : -diff
    })
    return [...withDeadline, ...withoutDeadline]
}
