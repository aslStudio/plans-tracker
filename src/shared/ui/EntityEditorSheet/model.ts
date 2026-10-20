import type { AccentColor } from '@/shared/config/color'

export type EntityEditorValue = {
    label: string
    color: AccentColor | null
}

export type EntityEditorSheetProps = {
    title: string
    /** A group always has a color; a priority can go without one. */
    allowNoColor: boolean
    initialValue: EntityEditorValue
    onClose: () => void
    onSubmit: (value: EntityEditorValue) => void
    /** Omitted while creating — there's nothing to delete yet. */
    onDelete?: () => void
}
