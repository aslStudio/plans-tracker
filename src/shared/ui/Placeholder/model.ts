import React from 'react'
import { type StyleProp, type ViewStyle } from 'react-native'

import { TheTextProps } from '@/shared/ui/TheText'

export type PlaceholderProps = React.PropsWithChildren<{
    title: string
    description?: string
    size?: 'default' | 'medium' | 'large'
    style?: StyleProp<ViewStyle>
}>

export const sizeMap: Record<
    NonNullable<PlaceholderProps['size']>,
    {
        title: TheTextProps
        description: TheTextProps
    }
> = {
    ['default']: {
        title: {
            size: 'body',
            weight: '500',
            align: 'center',
        },
        description: {
            size: 'subheadline',
            color: 'labels-secondary',
            align: 'center',
        },
    },
    ['medium']: {
        title: {
            size: 'title-3',
            weight: '700',
            align: 'center',
        },
        description: {
            size: 'subheadline',
            color: 'labels-secondary',
            align: 'center',
        },
    },
    ['large']: {
        title: {
            size: 'title-1',
            weight: '700',
            align: 'center',
        },
        description: {
            size: 'title-2',
            color: 'labels-secondary',
            align: 'center',
        },
    },
}
