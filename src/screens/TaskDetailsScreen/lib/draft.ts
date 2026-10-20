import { DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'
import type {
    CreateTaskInput,
    EntityId,
    RepeatRule,
    Task,
    TaskCompletion,
} from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'

/**
 * The screen's local, freely-editable copy of a task — same shape the
 * create and edit flows both work with, since this is one unified screen
 * ("перейдя в задачи можно будет сразу все редактировать"). `description`
 * holds the rich-text editor's HTML, not plain text.
 */
export type TaskDraft = {
    title: string
    note?: string
    description: string
    statusId: EntityId
    groupId: EntityId | null
    priorityId: EntityId | null
    startMinute?: number | null
    durationMinutes?: number
    startDate: string | null
    endDate: string | null
    repeat: RepeatRule | null
}

/** `prefilledDate` is for opening "add task" from a specific day (e.g. `DayTasksScreen`'s own add button) — the new task should land on that day, not in the dateless backlog. */
export function createEmptyDraft(
    prefilledDate: string | null = null,
): TaskDraft {
    return {
        title: '',
        note: '',
        description: '',
        statusId: TODO_STATUS_ID,
        groupId: null,
        priorityId: null,
        startMinute: null,
        durationMinutes: 60,
        startDate: prefilledDate ?? todayDateString(),
        endDate: prefilledDate,
        repeat: null,
    }
}

export function taskToDraft(
    task: Task,
    occurrenceDate?: string,
    completions: TaskCompletion[] = [],
): TaskDraft {
    return {
        title: task.title,
        note: task.note ?? '',
        description: task.description ?? '',
        statusId:
            task.repeat && occurrenceDate
                ? completions.some(
                      (c) =>
                          c.taskId === task.id &&
                          c.occurrenceDate === occurrenceDate,
                  )
                    ? DONE_STATUS_ID
                    : (task.occurrenceStatusIds?.[occurrenceDate] ??
                      TODO_STATUS_ID)
                : task.statusId,
        groupId: task.groupId ?? null,
        priorityId: task.priorityId ?? null,
        startMinute: task.startMinute ?? null,
        durationMinutes: task.durationMinutes ?? 60,
        startDate: task.startDate ?? null,
        endDate: task.endDate ?? null,
        repeat: task.repeat ?? null,
    }
}

export function draftToCreateInput(draft: TaskDraft): CreateTaskInput {
    return {
        title: draft.title,
        note: draft.note ?? '',
        description: draft.description,
        statusId: draft.statusId,
        groupId: draft.groupId,
        priorityId: draft.priorityId,
        startMinute: draft.startMinute ?? null,
        durationMinutes: draft.durationMinutes ?? 60,
        startDate: draft.startDate,
        endDate: draft.endDate,
        repeat: draft.repeat,
    }
}

/** An abandoned "new task" draft (closed without ever getting a title) isn't worth persisting. */
export function isBlankDraft(draft: TaskDraft): boolean {
    return draft.title.trim().length === 0
}

/** Apply both date fields in one update, so moving a task never leaves an inverted range. */
export function normalizeTaskDraftPatch(
    draft: TaskDraft,
    patch: Partial<TaskDraft>,
): Partial<TaskDraft> {
    const endDate = patch.endDate === undefined ? draft.endDate : patch.endDate
    if (patch.startDate && endDate && patch.startDate > endDate) {
        return { ...patch, endDate: patch.startDate }
    }
    return patch
}
