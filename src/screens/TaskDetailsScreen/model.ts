import type { EntityEditorValue } from '@/shared/ui/EntityEditorSheet'
import type { TaskGroup, TaskPriority, TaskStatus } from '@/shared/api'

import type { TaskDraft } from './lib/draft'

export type TaskDetailsScreenProps = {
    draft: TaskDraft
    statuses: TaskStatus[]
    groups: TaskGroup[]
    priorities: TaskPriority[]
    /** Same opt-in gating as `TasksScreenProps` — the row simply isn't rendered when off. */
    useGroups: boolean
    usePriority: boolean
    useTaskRecurrence?: boolean
    useTaskTime?: boolean
    /** Creating hides the delete action — there's nothing to delete yet. */
    isNew: boolean
    onChange: (patch: Partial<TaskDraft>) => void
    onCreateGroup?: (value: EntityEditorValue) => Promise<TaskGroup>
    onCreatePriority?: (value: EntityEditorValue) => Promise<TaskPriority>
    onDelete?: () => void
    onClose: () => void
    onSave: () => void
}
