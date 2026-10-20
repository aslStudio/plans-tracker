import { tasksRepository, DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'
import {
    acknowledgeTaskToggle,
    readPendingTaskToggles,
    updateTaskWidget,
} from '../../../modules/task-widget-data'
import { buildTaskWidgetPayload } from './lib/build-task-widget-payload'

let queue: Promise<void> = Promise.resolve()

export function syncTaskWidget(): Promise<void> {
    const run = queue.then(async () => {
        const pending = (await readPendingTaskToggles()).sort((a, b) =>
            a.id.localeCompare(b.id),
        )
        for (const toggle of pending) {
            const task = await tasksRepository.get(toggle.taskId)
            if (task?.repeat) {
                await tasksRepository.setCompletion(
                    task.id,
                    toggle.date,
                    toggle.completed,
                )
            } else if (task) {
                await tasksRepository.update(task.id, {
                    statusId: toggle.completed
                        ? DONE_STATUS_ID
                        : TODO_STATUS_ID,
                })
            }
        }
        const [tasks, statuses, completions] = await Promise.all([
            tasksRepository.list(),
            tasksRepository.listStatuses(),
            tasksRepository.listAllCompletions(),
        ])
        updateTaskWidget(
            buildTaskWidgetPayload(
                tasks,
                statuses,
                completions,
                todayDateString(),
            ),
        )
        // Acknowledge only after both persistence and the replacement snapshot succeed.
        for (const toggle of pending) await acknowledgeTaskToggle(toggle.id)
    })
    queue = run.catch(() => {})
    return run
}
