import type { StyleProp, ViewStyle } from 'react-native'

import type { Color } from '@/shared/config/color'

export type LoaderProps = {
    size: number
    color: Color | string
    isAnimated?: boolean
    style?: StyleProp<ViewStyle>
}
