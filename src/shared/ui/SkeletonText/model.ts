import type { StyleProp, ViewStyle } from 'react-native'

import type { TheTextSize } from '@/shared/ui/TheText'

export type SkeletonTextProps = {
    /** Matches `TheText`'s own size scale so a text-line placeholder tracks the real line it stands in for. */
    size?: TheTextSize
    width?: number | `${number}%`
    style?: StyleProp<ViewStyle>
}
