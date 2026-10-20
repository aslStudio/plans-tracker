import type { ReactNode } from 'react'
import type { PressableProps } from 'react-native'

export type ButtonVariant = 'primary' | 'secondary' | 'plain'
export type ButtonView =
    'brand' | 'destructive' | 'neutral' | 'overlay' | 'grouped'
export type ButtonContentState = {
    foregroundColor: string
    backgroundColor: string
    isTertiaryFill: boolean
    pressed: boolean
    isDisabled: boolean
    isLoading: boolean
    isLiquidGlass: boolean
}

export type ButtonBaseWrapperProps = Omit<
    PressableProps,
    'children' | 'disabled' | 'onPress' | 'onLongPress'
> & {
    onPress?: () => void
    onLongPress?: () => void
    /** Omitted / auto: content width including padding. */
    width?: 'auto' | number | '100%'
    /** Exact height in React Native layout units, including padding. */
    height: number
    variant?: ButtonVariant
    view?: ButtonView
    isLiquidGlass?: boolean
    isDisabled?: boolean
    disabledAppearance?: 'muted' | 'opacity'
    /** Blocks presses and exposes busy state. The caller owns the spinner/label. */
    isLoading?: boolean
    /** Set to 0 for an icon-only circle with width === height. */
    paddingHorizontal?: number
    isFlex?: boolean
    children: ReactNode | ((state: ButtonContentState) => ReactNode)
}
