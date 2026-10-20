import type { ReactNode } from 'react'

import type { Color } from '@/shared/config/color'

export type RowProps = {
    label: string
    labelAccessory?: ReactNode
    description?: string
    icon?: ReactNode
    RightElement?: ReactNode
    onPress?: () => void
    /** Handles only the left label/icon area while leaving `RightElement` independent. */
    onLabelPress?: () => void
    disabled?: boolean
    labelColor?: Color
    testID?: string

    paddingVertical?: number
    paddingHorizontal?: number
}

export type RowIconBubbleProps = {
    icon?: ReactNode
    backgroundColor?: Color
    size?: number
    shape?: 'circle' | 'squircle'
}
