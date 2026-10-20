import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import { MonoIconName } from '@/shared/config/icons'
import { TheTextSize } from '@/shared/ui/TheText'

export type TheButtonProps = React.PropsWithChildren<{
    style?: StyleProp<ViewStyle>

    variant?: 'primary' | 'secondary' | 'plain'
    view?: 'brand' | 'destructive' | 'neutral' | 'overlay' | 'grouped'
    size?: '52' | '44' | '36' | '28'

    iconLeft?: MonoIconName
    iconRight?: MonoIconName
    iconSize?: number

    isLoading?: boolean
    isDisabled?: boolean
    isLiquidGlass?: boolean
    isWide?: boolean
    isFlex?: boolean

    onPress: () => void
}>

export const heightMap: Record<NonNullable<TheButtonProps['size']>, number> = {
    ['52']: 52,
    ['44']: 44,
    ['36']: 36,
    ['28']: 28,
}

export const paddingMap: Record<NonNullable<TheButtonProps['size']>, number> = {
    ['52']: 20,
    ['44']: 20,
    ['36']: 14,
    ['28']: 12,
}

export const iconSizeMap: Record<
    NonNullable<TheButtonProps['size']>,
    number
> = {
    ['52']: 28,
    ['44']: 25,
    ['36']: 20,
    ['28']: 20,
}

export const textSizeMap: Record<
    NonNullable<TheButtonProps['size']>,
    NonNullable<TheTextSize>
> = {
    ['52']: 'body',
    ['44']: 'body',
    ['36']: 'subheadline',
    ['28']: 'subheadline',
}
