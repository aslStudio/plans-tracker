import { t } from '@/shared/lib/i18n'
import type { Color } from '@/shared/config/color'
import type { Task, TaskGroup } from '@/shared/api'

export type ResolvedGroupLabel = { text: string; color: Color }

/**
 * `null` means "don't show a group line at all" — groups are turned off
 * app-wide. Once they're on, this always resolves to *something*: the
 * task's own group, or the gray "Другие" fallback for a task with no group
 * (or one pointing at a group that's since been deleted).
 */
export function resolveGroupLabel(
    task: Task,
    groups: TaskGroup[],
    useGroups: boolean,
): ResolvedGroupLabel | null {
    if (!useGroups) return null

    const group = groups.find((candidate) => candidate.id === task.groupId)
    if (group) return { text: group.label, color: group.color }

    return { text: t('Другие'), color: 'gray-gray' }
}
