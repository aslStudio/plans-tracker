export type WheelPickerOption = {
    label: string
    value: string
}

export type WheelPickerColumn = {
    options: readonly WheelPickerOption[]
    value: string
    onChange: (value: string) => void
    /** Relative width weighting among columns, like flex. Defaults to 1. */
    flex?: number
}

export type WheelPickerProps = {
    isOpen: boolean
    title?: string
    columns: readonly WheelPickerColumn[]
    setIsOpen: () => void
    onSubmit: () => void
    /** Renders alongside "Применить" as an equal-width secondary button instead of one full-width submit button — omit for a field with nothing sensible to reset to. */
    onReset?: () => void
    resetLabel?: string
    submitLabel?: string
}
