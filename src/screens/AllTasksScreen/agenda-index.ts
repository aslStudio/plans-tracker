import type { Task } from '@/shared/api'
import { tasksOnDate, type TaskAgendaDay } from '@/entities/task'

/** Pagination reuses previous day objects, so mounted cards can skip rendering. */
export function createAgendaIndex(tasks: Task[]) {
    const days = new Map<string, TaskAgendaDay>()
    return (date: string): TaskAgendaDay => {
        let day = days.get(date)
        if (!day) {
            day = { date, tasks: tasksOnDate(tasks, date) }
            days.set(date, day)
        }
        return day
    }
}
