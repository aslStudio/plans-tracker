import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type SkeletonWrapperProps = {
    isLoading: boolean
    skeleton: ReactNode
    children: ReactNode
    style?: StyleProp<ViewStyle>
}
