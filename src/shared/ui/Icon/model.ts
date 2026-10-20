import type { StyleProp, ViewProps, ViewStyle } from 'react-native'

import type { Color } from '@/shared/config/color'
import type { MonoIconName, MultiIconName } from '@/shared/config/icons'

type CommonProps = {
    style?: StyleProp<ViewStyle>
    size?: number
    width?: number
    height?: number
    testID?: string
    pointerEvents?: ViewProps['pointerEvents']
}

export type MonoProps = CommonProps & {
    name: MonoIconName
    color?: Color
    nativeColor?: string
}

export type MultiProps = CommonProps & {
    name: MultiIconName
    color?: never
    nativeColor?: never
}

export type IconProps = MonoProps | MultiProps
export type IconSkeletonProps = { style?: StyleProp<ViewStyle>; size: number }
