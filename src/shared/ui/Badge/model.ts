import React from 'react'

import { type Color } from '@/shared/config/color'

export type BadgeProps = React.PropsWithChildren<{
    view: 'primary' | 'secondary' | 'tertiary'
}>

export const textColorMap: Record<BadgeProps['view'], Color> = {
    primary: 'gray-white',
    secondary: 'brand',
    tertiary: 'labels-primary',
}
