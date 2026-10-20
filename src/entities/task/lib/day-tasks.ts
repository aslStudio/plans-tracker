import type { Task } from '@/shared/api'

/**
 * "Обновить" for an overdue task — brings its end date up to today so it
 * stops being overdue. A plain one-day task collapses to today entirely; a
 * genuinely ranged task keeps its original start and only pulls the end
 * forward, since collapsing it too would silently drop the range.
 */
export function actualizeTaskDates(
    task: Task,
    today: string,
): { startDate: string; endDate: string } {
    const isRanged =
        Boolean(task.startDate) &&
        Boolean(task.endDate) &&
        task.startDate !== task.endDate
    return {
        startDate: isRanged ? task.startDate! : today,
        endDate: today,
    }
}
