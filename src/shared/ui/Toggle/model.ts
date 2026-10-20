export type ToggleProps = {
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
    accessibilityLabel?: string
    testID?: string
}
