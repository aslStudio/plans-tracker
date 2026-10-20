import { builtinLabel } from '@/shared/lib/i18n/builtin-label'
import type { Color } from '@/shared/config/color'
import type { Task, TaskPriority } from '@/shared/api'

export type ResolvedPriorityLabel = { text: string; color: Color }

/**
 * Unlike a group, a missing priority has no "Другие"-style fallback — the
 * field is meant to stay invisible until the task actually has one set, not
 * announce its own absence. `null` covers: priority turned off app-wide,
 * no `priorityId` on the task, or (defensively) a `priorityId` pointing at
 * a priority that's since been deleted.
 */
export function resolvePriorityLabel(
    task: Task,
    priorities: TaskPriority[],
    usePriority: boolean,
): ResolvedPriorityLabel | null {
    if (!usePriority || !task.priorityId) return null

    const priority = priorities.find(
        (candidate) => candidate.id === task.priorityId,
    )
    if (!priority) return null

    return {
        text: builtinLabel(priority),
        color: priority.color ?? 'labels-tertiary',
    }
}
