import type { Task, UpdateTaskInput, WeekDay } from '@/shared/api'
import { addDays, parseLocalDateString } from '@/shared/lib/date'

/** Shift a task's complete range, retaining its time and duration. */
export function rescheduleTaskDates(
    task: Task,
    target: string,
    source?: string,
): UpdateTaskInput {
    const start = task.startDate ?? task.endDate
    const end = task.endDate ?? task.startDate
    if (!start || !end) return { startDate: target, endDate: target }
    const anchor = source && /^\d{4}-\d{2}-\d{2}$/.test(source) ? source : end
    const utc = (value: string) => {
        const [y, m, d] = value.split('-').map(Number)
        return Date.UTC(y, m - 1, d)
    }
    const shift = Math.round((utc(target) - utc(anchor)) / 86400000)
    const startDate = addDays(start, shift)
    const repeat =
        task.repeat?.type === 'weekly'
            ? {
                  ...task.repeat,
                  daysOfWeek: task.repeat.daysOfWeek.map(
                      (day) => ((day + (shift % 7) + 7) % 7) as WeekDay,
                  ),
              }
            : task.repeat?.type === 'monthly'
              ? {
                    ...task.repeat,
                    dayOfMonth: parseLocalDateString(startDate).getDate(),
                }
              : task.repeat
    return {
        startDate,
        endDate: addDays(end, shift),
        ...(repeat ? { repeat } : {}),
    }
}
