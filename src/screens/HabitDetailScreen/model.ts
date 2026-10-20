import type { Habit, HabitCategory, HabitCompletion } from '@/shared/api'
import type { AccentColor } from '@/shared/config/color'

import type { HabitDraft } from '@/features/edit-habit'

export type HabitDetailScreenProps = {
    draft: HabitDraft
    /** `null` while creating — the progress chart below needs a persisted habit's `id`/`createdAt`, which a draft doesn't have yet. */
    habit: Habit | null
    categories: HabitCategory[]
    /** App-wide setting, off by default — most habits don't need one. */
    useCategories: boolean
    /** Only meaningful once `habit` is set — empty while creating. */
    completions: HabitCompletion[]
    today: string
    /** Creating hides the delete action and the progress chart — mirrors `TaskDetailsScreenProps.isNew`. */
    isNew: boolean
    onChange: (patch: Partial<HabitDraft>) => void
    onSetCompletion: (habitId: string, date: string, completed: boolean) => void
    onCreateCategory: (input: {
        label: string
        color: AccentColor | null
    }) => Promise<HabitCategory>
    onDelete?: () => void
    onClose: () => void
    onSave: () => void
}
