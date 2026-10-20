import type { Task, TaskCompletion, TaskStatus } from '@/shared/api'
import { isTaskCompleted, tasksOnDate } from '@/entities/task'
import { addDays } from '@/shared/lib/date'
import type { WidgetTaskDay } from '../../../../modules/task-widget-data'

// Precompute a week so the widget can advance at midnight without launching JS.
export function buildTaskWidgetPayload(
    tasks: Task[],
    taskStatuses: TaskStatus[],
    taskCompletions: TaskCompletion[],
    today: string,
): WidgetTaskDay[] {
    return Array.from({ length: 7 }, (_, offset) => {
        const date = addDays(today, offset)
        return {
            date,
            items: tasksOnDate(tasks, date).map((task) => ({
                id: task.id,
                title: task.title,
                completed: task.repeat
                    ? taskCompletions.some(
                          (completion) =>
                              completion.taskId === task.id &&
                              completion.occurrenceDate === date,
                      )
                    : isTaskCompleted(task, taskStatuses),
                recurring: Boolean(task.repeat),
            })),
        }
    })
}
