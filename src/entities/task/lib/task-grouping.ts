import type { RepeatRule, Task, TaskCompletion, TaskStatus } from '@/shared/api'
import { addDays, formatDateRange } from '@/shared/lib/date'
import { occursOn } from '@/entities/calendar-event'

export type TaskDayGroup = 'overdue' | 'today' | 'tomorrow' | 'backlog'

export function isTaskCompleted(task: Task, statuses: TaskStatus[]): boolean {
    return (
        statuses.find((status) => status.id === task.statusId)?.isCompleted ??
        false
    )
}

/** A plain one-day task has `startDate === endDate` (the default — both set to the same value). Only an explicitly extended task has them differ. */
function isRanged(task: Task): boolean {
    return (
        Boolean(task.startDate) &&
        Boolean(task.endDate) &&
        task.startDate !== task.endDate
    )
}

/**
 * Which day section(s) a task renders in.
 *
 * No date at all -> backlog, always a single bucket. Overdue is judged by
 * `endDate` specifically, not `startDate` — a range that's still running
 * isn't overdue just because it started in the past.
 *
 * A plain one-day task (`startDate === endDate`) resolves to exactly one
 * bucket, same as a single deadline always did — due later than tomorrow
 * simply isn't placed yet, there's no calendar view on this screen for that.
 *
 * Only an explicitly *ranged* task (an opt-in extension of the entity, not
 * the default) shows in every rendered day card it overlaps — that's the
 * one case pending-today-and-tomorrow duplication is actually correct for,
 * and why sorting by end date is worth having.
 */
export function resolveTaskDays(
    task: Task,
    statuses: TaskStatus[],
    today: string,
    tomorrow: string,
): TaskDayGroup[] {
    if (!task.startDate && !task.endDate) return ['backlog']

    const start = task.startDate ?? task.endDate!
    const end = task.endDate ?? task.startDate!
    const completed = isTaskCompleted(task, statuses)

    if (end < today) return completed ? [] : ['overdue']

    if (completed) {
        if (end === today) return ['today']
        return ['tomorrow'] // done early for something due tomorrow or later
    }

    if (!isRanged(task)) {
        if (end === today) return ['today']
        if (end === tomorrow) return ['tomorrow']
        return [] // a plain one-day task due later than tomorrow — not shown yet
    }

    const days: TaskDayGroup[] = []
    if (start <= today && today <= end) days.push('today')
    if (start <= tomorrow && tomorrow <= end) days.push('tomorrow')
    return days
}

/** Red/urgent styling kicks in once the *end* date has passed and the task hasn't been completed. */
export function isTaskOverdue(
    task: Task,
    statuses: TaskStatus[],
    today: string,
): boolean {
    if (isTaskCompleted(task, statuses)) return false
    const end = task.endDate ?? task.startDate
    return Boolean(end) && end! < today
}

/**
 * The text for the row's date line, or `null` to show nothing there. An
 * explicit range always shows "start - end" — that span is the whole point
 * of it, regardless of which day card it's sitting under. A plain one-day
 * task only shows its date when that date doesn't match the day it's
 * grouped under (an overdue task carried forward, where the real date is
 * otherwise invisible).
 */
export function resolveDateLineText(
    task: Task,
    dayGroupDate: string,
): string | null {
    if (!task.startDate && !task.endDate) return null
    const start = task.startDate ?? task.endDate!
    const end = task.endDate ?? task.startDate!

    if (isRanged(task)) return formatDateRange(start, end)
    if (end !== dayGroupDate) return formatDateRange(start, end)
    return null
}

/** Every task actually due on `date` — a one-off by its start–end range, a recurring one by cadence (tagged with `occurrenceDate`). Unlike `resolveTaskDays`/`groupTasksByDay`, this doesn't roll an unfinished overdue task forward onto "today" — it places everything on its real calendar date, which is what a continuous day-by-day agenda needs. */
export function tasksOnDate(tasks: Task[], date: string): TaskOccurrence[] {
    const result: TaskOccurrence[] = []
    for (const task of tasks) {
        if (task.repeat) {
            const start =
                task.startDate ?? task.endDate ?? task.createdAt.slice(0, 10)
            if (occursOn(start, task.repeat, date))
                result.push({ ...task, occurrenceDate: date })
            continue
        }
        if (!task.startDate && !task.endDate) continue
        const start = task.startDate ?? task.endDate!
        const end = task.endDate ?? task.startDate!
        if (date < start || date > end) continue
        result.push(task)
    }
    return result
}

export type GroupedTasks = {
    overdue: TaskOccurrence[]
    today: TaskOccurrence[]
    tomorrow: TaskOccurrence[]
    future: { date: string; tasks: TaskOccurrence[] }[]
    backlog: TaskOccurrence[]
}

export type TaskOccurrence = Task & { occurrenceDate?: string }

function previousOccurrence(
    start: string,
    repeat: RepeatRule,
    today: string,
): string | null {
    if (today <= start) return null
    if (repeat.type === 'custom') {
        if (repeat.everyNDays < 1) return null
        const [sy, sm, sd] = start.split('-').map(Number)
        const [ty, tm, td] = today.split('-').map(Number)
        const elapsed = Math.round(
            (Date.UTC(ty, tm - 1, td) - Date.UTC(sy, sm - 1, sd)) / 86400000,
        )
        if (elapsed <= 0) return null
        const remainder = elapsed % repeat.everyNDays
        const offset = remainder === 0 ? repeat.everyNDays : remainder
        const candidate = addDays(today, -offset)
        return candidate >= start && occursOn(start, repeat, candidate)
            ? candidate
            : null
    }
    const limit =
        repeat.type === 'weekly' ? 7 : repeat.type === 'monthly' ? 31 : 1
    for (let offset = 1; offset <= limit; offset += 1) {
        const candidate = addDays(today, -offset)
        if (candidate >= start && occursOn(start, repeat, candidate))
            return candidate
    }
    return null
}

function occurrenceDone(
    taskId: string,
    date: string,
    completions: TaskCompletion[],
) {
    return completions.some(
        (item) => item.taskId === taskId && item.occurrenceDate === date,
    )
}

export function groupTasksByDay(
    tasks: Task[],
    statuses: TaskStatus[],
    today: string,
    daysAhead = 1,
    completions: TaskCompletion[] = [],
): GroupedTasks {
    const tomorrow = addDays(today, 1)
    const future = Array.from(
        { length: Math.max(0, daysAhead - 1) },
        (_, index) => ({
            date: addDays(today, index + 2),
            tasks: [] as TaskOccurrence[],
        }),
    )
    const groups: GroupedTasks = {
        overdue: [],
        today: [],
        tomorrow: [],
        future,
        backlog: [],
    }
    const addToDate = (task: Task, date: string, occurrence = false) => {
        const item: TaskOccurrence = occurrence
            ? { ...task, occurrenceDate: date }
            : task
        if (date === today) groups.today.push(item)
        else if (date === tomorrow) groups.tomorrow.push(item)
        else {
            const bucket = groups.future.find((day) => day.date === date)
            bucket?.tasks.push(item)
        }
    }

    for (const task of tasks) {
        if (task.repeat) {
            const start =
                task.startDate ?? task.endDate ?? task.createdAt.slice(0, 10)
            const prior = previousOccurrence(start, task.repeat, today)
            if (prior && !occurrenceDone(task.id, prior, completions)) {
                groups.overdue.push({ ...task, occurrenceDate: prior })
            }
            for (let offset = 0; offset <= daysAhead; offset += 1) {
                const date = addDays(today, offset)
                if (date >= start && occursOn(start, task.repeat, date))
                    addToDate(task, date, true)
            }
            continue
        }

        if (!task.startDate && !task.endDate) {
            groups.backlog.push(task)
            continue
        }
        const start = task.startDate ?? task.endDate!
        const end = task.endDate ?? task.startDate!
        const completed = isTaskCompleted(task, statuses)
        if (end < today) {
            // Completed past tasks stay on their original dates in the agenda.
            if (!completed) groups.overdue.push(task)
            continue
        }
        if (completed && start > today) {
            addToDate(task, start)
            continue
        }
        const rangeStart = start < today ? today : start
        const rangeEnd =
            end > addDays(today, daysAhead) ? addDays(today, daysAhead) : end
        for (let date = rangeStart; date <= rangeEnd; date = addDays(date, 1))
            addToDate(task, date)
    }
    return groups
}
