import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type SegmentControlSize = '32' | '50'

export type SegmentControlOption<T extends string = string> = {
    label: ReactNode
    value: T
    disabled?: boolean
}

export type SegmentControlProps<T extends string = string> = {
    options: readonly SegmentControlOption<T>[]
    value: T
    onChange: (value: T) => void
    size?: SegmentControlSize
    maxWidth?: number
    style?: StyleProp<ViewStyle>
    testID?: string
    /** Gives the track its own frosted-glass layer (a real `BlurView`) instead of just its flat `fill.tertiary` tint — for placement over an already-blurred/photo backdrop (see ProfileScreen's header), where the flat tint alone doesn't read as opaque enough on its own. Off by default: most placements sit on a solid card background, where a blur behind it would do nothing but cost a compositing layer. */
    blurred?: boolean
}

export const segmentControlMetrics = {
    '32': { height: 32, itemHeight: 28, itemPaddingVertical: 5 },
    '50': { height: 50, itemHeight: 46, itemPaddingVertical: 14 },
} as const
