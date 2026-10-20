import type { Task } from '@/shared/api'

/** The 1st of the earliest month any task touches — where the infinite-scroll-backward list should stop appending older months. `null` with no tasks at all. */
export function earliestTaskMonth(tasks: Task[]): Date | null {
    const dates = tasks
        .flatMap((task) => [task.startDate, task.endDate])
        .filter((d): d is string => Boolean(d))
    if (dates.length === 0) return null
    const earliest = dates.reduce((min, date) => (date < min ? date : min))
    const [year, month] = earliest.split('-').map(Number)
    return new Date(year, month - 1, 1)
}
