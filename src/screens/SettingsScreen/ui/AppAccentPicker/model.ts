import type { AccentName } from '@/shared/config/theme'

export type AppAccentPickerProps = {
    value: AccentName
    onChange: (value: AccentName) => void
}
