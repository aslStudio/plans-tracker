import type { Task } from '@/shared/api'
import { addDays } from '@/shared/lib/date'
import { tasksOnDate, type TaskOccurrence } from './task-grouping'

export type TaskAgendaDay = { date: string; tasks: TaskOccurrence[] }

const DEFAULT_MAX_DAYS_AHEAD = 180

/**
 * `today` (always, even empty), every later day with ≥1 task up to
 * `maxDaysAhead` (empty gaps skipped), then one trailing empty day right
 * after the last populated one — the "Все задачи" screen's forward window.
 * Computed once rather than paginated: a daily recurring task would make
 * "every future day with a task" infinite otherwise.
 */
export function buildFutureAgenda(
    tasks: Task[],
    today: string,
    maxDaysAhead = DEFAULT_MAX_DAYS_AHEAD,
): TaskAgendaDay[] {
    const days: TaskAgendaDay[] = [
        { date: today, tasks: tasksOnDate(tasks, today) },
    ]
    let lastDate = today
    for (let offset = 1; offset <= maxDaysAhead; offset += 1) {
        const date = addDays(today, offset)
        const dayTasks = tasksOnDate(tasks, date)
        if (dayTasks.length > 0) {
            days.push({ date, tasks: dayTasks })
            lastDate = date
        }
    }
    days.push({ date: addDays(lastDate, 1), tasks: [] })
    return days
}

/**
 * Days strictly before `beforeDate`, scanning back up to `maxDays`, with
 * ≥1 task — empty days are skipped entirely ("при наличии"), so scrolling up
 * only ever surfaces days that actually had something due. Returned
 * oldest-first, ready to prepend onto the agenda list.
 */
export function scanPastAgendaDays(
    tasks: Task[],
    beforeDate: string,
    maxDays: number,
): TaskAgendaDay[] {
    const days: TaskAgendaDay[] = []
    for (let offset = 1; offset <= maxDays; offset += 1) {
        const date = addDays(beforeDate, -offset)
        const dayTasks = tasksOnDate(tasks, date)
        if (dayTasks.length > 0) days.push({ date, tasks: dayTasks })
    }
    return days.reverse()
}
