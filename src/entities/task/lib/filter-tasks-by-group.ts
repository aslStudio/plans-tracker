import type { EntityId, Task } from '@/shared/api'

export type GroupFilterSelection = 'all' | 'ungrouped' | EntityId

export function filterTasksByGroup(
    tasks: Task[],
    selection: GroupFilterSelection,
): Task[] {
    if (selection === 'all') return tasks
    if (selection === 'ungrouped') return tasks.filter((task) => !task.groupId)
    return tasks.filter((task) => task.groupId === selection)
}
