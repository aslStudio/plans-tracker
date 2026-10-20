import type { Color } from '@/shared/config/color'

import type {
    CompletionRecord,
    EntityId,
    RepeatRule,
    Timestamps,
} from '../common/types'

/**
 * Fully user-defined, unlike statuses/priorities there are no built-in
 * categories — a habit can go uncategorized indefinitely if the user never
 * turns this on.
 */
export type HabitCategory = {
    id: EntityId
    label: string
    color?: Color
    order: number
}

export type Habit = {
    id: EntityId
    title: string
    startMinute?: number | null
    durationMinutes?: number
    categoryId?: EntityId | null
    /** Rich-text HTML, same shape and editor as `Task.description`. */
    note?: string
    description?: string
    /** Required, unlike a Task's optional `repeat` — a cadence is what makes it a habit rather than a one-off task. */
    repeat: RepeatRule
} & Timestamps

export type HabitCompletion = CompletionRecord & { habitId: EntityId }

export type CreateHabitInput = {
    title: string
    startMinute?: number | null
    durationMinutes?: number
    categoryId?: EntityId | null
    note?: string
    description?: string
    repeat: RepeatRule
}

export type UpdateHabitInput = Partial<CreateHabitInput>
