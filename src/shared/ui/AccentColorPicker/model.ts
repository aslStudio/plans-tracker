import type { AccentColor } from '@/shared/config/color'

export type AccentColorPickerProps = {
    value: AccentColor | null
    /** Adds a leading "no color" swatch — for priorities, which can go without one; a group always has a color. */
    allowNoColor?: boolean
    onChange: (value: AccentColor | null) => void
}
