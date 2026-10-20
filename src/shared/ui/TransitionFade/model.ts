import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type TransitionFadeProps = {
    /** While true, renders `skeleton`; once it flips to false, cross-fades into `children`. */
    loading: boolean
    skeleton: ReactNode
    children: ReactNode
    style?: StyleProp<ViewStyle>
}
