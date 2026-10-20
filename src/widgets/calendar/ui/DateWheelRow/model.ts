export type DateWheelRowProps = {
    label: string
    /** `YYYY-MM-DD`, or `null` for "not set". */
    value: string | null
    onChange: (value: string | null) => void
}
