import { t } from '@/shared/lib/i18n'
import type {
    Habit,
    HabitCompletion,
    NotificationSettings,
    Task,
    TaskCompletion,
    TaskStatus,
} from '@/shared/api'
import type { CalendarEvent } from '@/shared/api/calendar/model'
import { addDays } from '@/shared/lib/date'
import { computeTodaySummary } from '@/entities/habit'
import { eventOnDate } from '@/entities/calendar-event'
import {
    groupTasksByDay,
    isTaskCompleted,
    type TaskOccurrence,
} from '@/entities/task'

/** A notification this app would like scheduled — pure data, no `expo-notifications` dependency, so the decision logic stays testable without mocking native modules. */
export type PlannedNotification = {
    /** Stable across recomputations of the same day/occurrence, but carries no meaning beyond that — the scheduling service doesn't look it up. */
    id: string
    title: string
    body: string
    date: Date
}

function atLocalTime(dateString: string, hour: number, minute = 0): Date {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, hour, minute, 0, 0)
}

/** Drops anything whose time has already passed — a local notification can't be scheduled into the past, and a stale "today" instance from an earlier recompute shouldn't fire the moment it's rebuilt. */
function pushIfFuture(
    plans: PlannedNotification[],
    plan: PlannedNotification,
    now: Date,
) {
    if (plan.date.getTime() > now.getTime()) plans.push(plan)
}

function tallyToday(
    todayTasks: TaskOccurrence[],
    statuses: TaskStatus[],
    completions: TaskCompletion[],
    today: string,
): { done: number; total: number } {
    let done = 0
    for (const task of todayTasks) {
        if (task.repeat) {
            if (
                completions.some(
                    (completion) =>
                        completion.taskId === task.id &&
                        completion.occurrenceDate ===
                            (task.occurrenceDate ?? today),
                )
            )
                done += 1
        } else if (isTaskCompleted(task, statuses)) done += 1
    }
    return { done, total: todayTasks.length }
}

export type TasksNotificationInput = {
    tasks: Task[]
    statuses: TaskStatus[]
    completions: TaskCompletion[]
}

/**
 * `tasksEmptyDay` (10:00, today's list is empty), `tasksOverdue` (10:00 if
 * today has tasks, otherwise 11:00 so it doesn't double up with the empty-day
 * notification, only when overdue tasks actually exist), `tasksEndOfDay`
 * (18:00, today has tasks still open).
 */
export function planTaskNotifications(
    settings: NotificationSettings,
    { tasks, statuses, completions }: TasksNotificationInput,
    today: string,
    now: Date,
): PlannedNotification[] {
    const groups = groupTasksByDay(tasks, statuses, today, 0, completions)
    const isEmpty = groups.today.length === 0
    const { done, total } = tallyToday(
        groups.today,
        statuses,
        completions,
        today,
    )
    const plans: PlannedNotification[] = []

    if (settings.tasksEmptyDay && isEmpty) {
        pushIfFuture(
            plans,
            {
                id: 'tasks-empty-day',
                title: t('Список задач пуст'),
                body: t(
                    'На сегодня ещё нет ни одной задачи. Самое время её добавить.',
                ),
                date: atLocalTime(today, 10),
            },
            now,
        )
    }

    if (settings.tasksOverdue && groups.overdue.length > 0) {
        pushIfFuture(
            plans,
            {
                id: 'tasks-overdue',
                title: t('Есть просроченные задачи'),
                body: t(
                    'Со вчерашнего дня остались невыполненные задачи — стоит их проверить.',
                ),
                date: atLocalTime(today, isEmpty ? 11 : 10),
            },
            now,
        )
    }

    if (settings.tasksEndOfDay && done < total) {
        pushIfFuture(
            plans,
            {
                id: 'tasks-end-of-day',
                title: t('День подходит к концу'),
                body: t('На сегодня остались незакрытые задачи.'),
                date: atLocalTime(today, 18),
            },
            now,
        )
    }

    return plans
}

export type HabitsNotificationInput = {
    habits: Habit[]
    completionsByHabitId: Record<string, HabitCompletion[]>
}

/**
 * `habitsHalfDay` (12:00, nothing done yet today), `habitsEndOfDay` (20:00,
 * something is still open), `streakAtRisk` (20:00 — four hours before
 * midnight — today's streak not yet secured) and `streakBroken` (00:00
 * tomorrow, scheduled only when today would end incomplete; a later
 * recompute cancels it if the user finishes up before midnight).
 */
export function planHabitNotifications(
    settings: NotificationSettings,
    { habits, completionsByHabitId }: HabitsNotificationInput,
    today: string,
    now: Date,
): PlannedNotification[] {
    const { done, total } = computeTodaySummary(
        habits,
        completionsByHabitId,
        today,
    )
    const incomplete = total > 0 && done < total
    const plans: PlannedNotification[] = []

    if (settings.habitsHalfDay && total > 0 && done === 0) {
        pushIfFuture(
            plans,
            {
                id: 'habits-half-day',
                title: t('Половина дня позади'),
                body: t(
                    'Пока ни одна привычка сегодня не отмечена выполненной.',
                ),
                date: atLocalTime(today, 12),
            },
            now,
        )
    }

    if (settings.habitsEndOfDay && incomplete) {
        pushIfFuture(
            plans,
            {
                id: 'habits-end-of-day',
                title: t('День подходит к концу'),
                body: t('Не все привычки на сегодня отмечены выполненными.'),
                date: atLocalTime(today, 20),
            },
            now,
        )
    }

    if (settings.streakAtRisk && incomplete) {
        pushIfFuture(
            plans,
            {
                id: 'streak-at-risk',
                title: t('Серия под угрозой'),
                body: t(
                    'До конца дня осталось немного времени, а сегодняшняя серия ещё не закрыта.',
                ),
                date: atLocalTime(today, 20),
            },
            now,
        )
    }

    if (settings.streakBroken && incomplete) {
        pushIfFuture(
            plans,
            {
                id: 'streak-broken',
                title: t('Серия прервалась'),
                body: t(
                    'Сегодняшний день закончился без выполнения всех привычек.',
                ),
                date: atLocalTime(addDays(today, 1), 0),
            },
            now,
        )
    }

    return plans
}

export type CalendarNotificationInput = { events: CalendarEvent[] }

/** `calendarUpcoming` (15 minutes before start) and `calendarStart` (at start), expanded across today and the next `daysAhead` days so a bounded, re-plannable window never approaches the OS's pending-notification cap. */
export function planCalendarNotifications(
    settings: NotificationSettings,
    { events }: CalendarNotificationInput,
    today: string,
    now: Date,
    daysAhead = 2,
): PlannedNotification[] {
    const plans: PlannedNotification[] = []
    if (!settings.calendarUpcoming && !settings.calendarStart) return plans

    for (let offset = 0; offset <= daysAhead; offset += 1) {
        const date = addDays(today, offset)
        for (const event of events) {
            if (!eventOnDate(event, date)) continue
            const start = atLocalTime(date, 0)
            start.setMinutes(event.startMinute)

            if (settings.calendarUpcoming) {
                pushIfFuture(
                    plans,
                    {
                        id: `calendar-upcoming:${event.id}:${date}`,
                        title: t('Скоро мероприятие'),
                        body: t('«{0}» начнётся через 15 минут', [event.title]),
                        date: new Date(start.getTime() - 15 * 60 * 1000),
                    },
                    now,
                )
            }

            if (settings.calendarStart) {
                pushIfFuture(
                    plans,
                    {
                        id: `calendar-start:${event.id}:${date}`,
                        title: event.title,
                        body: t('Мероприятие началось'),
                        date: start,
                    },
                    now,
                )
            }
        }
    }

    return plans
}

export type NotificationPlanInput = {
    tasks: TasksNotificationInput
    habits: HabitsNotificationInput
    calendar: CalendarNotificationInput
}

export function planAllNotifications(
    settings: NotificationSettings,
    input: NotificationPlanInput,
    today: string,
    now: Date,
): PlannedNotification[] {
    if (!settings.enabled) return []
    return [
        ...planTaskNotifications(settings, input.tasks, today, now),
        ...planHabitNotifications(settings, input.habits, today, now),
        ...planCalendarNotifications(settings, input.calendar, today, now),
    ]
}
