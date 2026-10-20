/** App-wide opt-in extensions — all off by default, left for the user to turn on once they actually want the extra structure. */
export type AppSettings = {
    useGroups: boolean
    usePriority: boolean
    useHabitCategories: boolean
    /** Number of future calendar days shown as task sections on the main screen. */
    taskDaysAhead: number
    /** Task recurrence is an optional task detail, off until explicitly enabled. */
    taskRecurrenceEnabled: boolean
    /** Scheduling tasks at a time in the calendar is opt-in. */
    taskTimeEnabled: boolean
}

export const defaultAppSettings: AppSettings = {
    useGroups: false,
    usePriority: false,
    useHabitCategories: false,
    taskDaysAhead: 1,
    taskRecurrenceEnabled: false,
    taskTimeEnabled: false,
}
