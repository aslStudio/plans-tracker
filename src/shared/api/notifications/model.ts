/**
 * All per-group switches default to on — unlike `AppSettings`' opt-in
 * extensions, these only ever take effect once `enabled` is true (the
 * system permission has been granted), so there's nothing to protect the
 * user from by defaulting them off.
 */
export type NotificationSettings = {
    /** System notification permission requested and granted. */
    enabled: boolean
    tasksEmptyDay: boolean
    tasksOverdue: boolean
    tasksEndOfDay: boolean
    habitsHalfDay: boolean
    habitsEndOfDay: boolean
    calendarUpcoming: boolean
    calendarStart: boolean
    streakAtRisk: boolean
    streakBroken: boolean
}

export const defaultNotificationSettings: NotificationSettings = {
    enabled: false,
    tasksEmptyDay: true,
    tasksOverdue: true,
    tasksEndOfDay: true,
    habitsHalfDay: true,
    habitsEndOfDay: true,
    calendarUpcoming: true,
    calendarStart: true,
    streakAtRisk: true,
    streakBroken: true,
}
