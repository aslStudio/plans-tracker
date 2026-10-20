import type { CreateHabitInput, EntityId, Habit } from '@/shared/api'

/** Same unified create/edit shape as `TaskDraft` — this screen handles both flows. */
export type HabitDraft = {
    title: string
    startMinute?: number | null
    durationMinutes?: number
    categoryId: EntityId | null
    note?: string
    description: string
    repeat: Habit['repeat']
}

export function createEmptyDraft(): HabitDraft {
    return {
        title: '',
        startMinute: null,
        durationMinutes: 60,
        categoryId: null,
        note: '',
        description: '',
        repeat: { type: 'daily' },
    }
}

export function habitToDraft(habit: Habit): HabitDraft {
    return {
        title: habit.title,
        startMinute: habit.startMinute ?? null,
        durationMinutes: habit.durationMinutes ?? 60,
        categoryId: habit.categoryId ?? null,
        note: habit.note ?? '',
        description: habit.description ?? '',
        repeat: habit.repeat,
    }
}

export function draftToCreateInput(draft: HabitDraft): CreateHabitInput {
    return {
        title: draft.title,
        startMinute: draft.startMinute ?? null,
        durationMinutes: draft.durationMinutes ?? 60,
        categoryId: draft.categoryId,
        note: draft.note ?? '',
        description: draft.description,
        repeat: draft.repeat,
    }
}

/** An abandoned "new habit" draft (closed without ever getting a title) isn't worth persisting. */
export function isBlankDraft(draft: HabitDraft): boolean {
    return draft.title.trim().length === 0
}
