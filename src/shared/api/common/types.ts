export type EntityId = string

export type Timestamps = {
    createdAt: string
    updatedAt: string
}

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Shared recurrence shape for both Task and Habit. `weekly` carries explicit
 * weekdays (not just an interval) so "every Mon/Wed/Fri" is representable,
 * not only "every N weeks". `custom` is the escape hatch for an arbitrary
 * N-day cadence that doesn't fit the fixed daily/weekly/monthly buckets.
 */
export type RepeatRule =
    | { type: 'daily' }
    | { type: 'weekly'; daysOfWeek: WeekDay[] }
    | { type: 'monthly'; dayOfMonth: number }
    | { type: 'custom'; everyNDays: number }

/**
 * One occurrence being marked done, for anything that recurs (a repeating
 * Task, or a Habit). `occurrenceDate` is the calendar date (YYYY-MM-DD,
 * local) the completion is *for*, distinct from `completedAt` — when the tap
 * actually happened, which matters once a widget or background sync can
 * record it after the fact.
 */
export type CompletionRecord = {
    id: EntityId
    occurrenceDate: string
    completedAt: string
}
