import type { AccentColor, Color } from '@/shared/config/color'

import type {
    CompletionRecord,
    EntityId,
    RepeatRule,
    Timestamps,
} from '../common/types'

/**
 * A status is a user-manageable entity, not a fixed enum — the two built-in
 * ones ("todo"/"done") always exist so a brand-new Task has somewhere to
 * start and progress/streak math has something to call "complete", but the
 * user can rename them, add their own (e.g. "In Progress", "Blocked") and
 * mark any status as completion-counting via `isCompleted`.
 */
export type TaskStatus = {
    id: EntityId
    label: string
    color?: Color
    order: number
    isCompleted: boolean
    isBuiltIn: boolean
}

export const TODO_STATUS_ID: EntityId = 'status-todo'
export const DONE_STATUS_ID: EntityId = 'status-done'

export const defaultTaskStatuses: TaskStatus[] = [
    {
        id: TODO_STATUS_ID,
        label: 'К выполнению',
        order: 0,
        isCompleted: false,
        isBuiltIn: true,
    },
    {
        id: DONE_STATUS_ID,
        label: 'Готово',
        color: 'accent-green',
        order: 1,
        isCompleted: true,
        isBuiltIn: true,
    },
]

/**
 * Priorities follow the exact same user-manageable shape as statuses —
 * seeded defaults, freely renamed/recolored, custom ones addable — rather
 * than a fixed Low/Medium/High enum.
 */
export type TaskPriority = {
    id: EntityId
    label: string
    color?: Color
    order: number
    isBuiltIn: boolean
}

export const defaultTaskPriorities: TaskPriority[] = [
    {
        id: 'priority-low',
        label: 'Низкий',
        color: 'gray-gray',
        order: 0,
        isBuiltIn: true,
    },
    {
        id: 'priority-medium',
        label: 'Средний',
        color: 'accent-yellow',
        order: 1,
        isBuiltIn: true,
    },
    {
        id: 'priority-high',
        label: 'Высокий',
        color: 'accent-red',
        order: 2,
        isBuiltIn: true,
    },
]

/**
 * Fully optional, same as a Habit's category — a whole app-level setting can
 * turn group display off entirely (see `TasksScreenProps.useGroups`), and
 * even when it's on, no groups need to exist yet. Unlike statuses/priorities,
 * color isn't optional here — "цвет (один из акцентов)" is the whole point
 * of a group visually, not an afterthought.
 */
export type TaskGroup = {
    id: EntityId
    label: string
    color: AccentColor
    order: number
}

export type CreateTaskGroupInput = {
    label: string
    color: AccentColor
}

export type UpdateTaskGroupInput = Partial<
    CreateTaskGroupInput & { order: number }
>

/**
 * A task's date is a range — `startDate`/`endDate` — not a single deadline.
 * By default they're the same value (a plain one-day task); "расширить
 * сущность" (an opt-in, not built yet) is what lets a task get a distinct
 * `endDate`, turning it into a genuine multi-day span that shows across
 * every day card it overlaps and is judged overdue by `endDate`, not
 * `startDate`. Both null together means no date at all — the task sits in
 * the backlog.
 */
export type Task = {
    id: EntityId
    title: string
    note?: string
    description?: string
    statusId: EntityId
    priorityId?: EntityId | null
    groupId?: EntityId | null
    /** Local time, minutes after midnight. Null means no scheduled time. */
    startMinute?: number | null
    durationMinutes?: number
    startDate?: string | null
    endDate?: string | null
    /** `null`/omitted for a one-off task. Set, it turns the task into a recurring one tracked via `TaskCompletion` per occurrence instead of a single `statusId` flip. */
    repeat?: RepeatRule | null
    occurrenceStatusIds?: Record<string, EntityId>
} & Timestamps

export type TaskCompletion = CompletionRecord & { taskId: EntityId }

export type CreateTaskInput = {
    title: string
    note?: string
    description?: string
    /** Defaults to `TODO_STATUS_ID`. */
    statusId?: EntityId
    priorityId?: EntityId | null
    groupId?: EntityId | null
    /** Give either one alone to get a plain one-day task — the repository mirrors it onto the other. */
    /** Local time, minutes after midnight. Null means no scheduled time. */
    startMinute?: number | null
    durationMinutes?: number
    startDate?: string | null
    endDate?: string | null
    repeat?: RepeatRule | null
    occurrenceStatusIds?: Record<string, EntityId>
}

export type UpdateTaskInput = Partial<CreateTaskInput>
