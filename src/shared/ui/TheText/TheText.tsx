import { Link } from 'expo-router'
import type { ComponentProps } from 'react'
import { Text, type TextProps } from 'react-native'

import { useThemeColor } from '@/shared/lib/theme/use-theme-color'

import { DefaultTextColor, DefaultTextFont, type TheTextProps } from './model'
import { buildTextStyle } from './styles'

export function TheText({
    tag = 'text',
    size,
    weight,
    font = DefaultTextFont,
    color = DefaultTextColor,
    align,
    style,
    ...rest
}: TheTextProps) {
    const resolvedColor = useThemeColor(color)
    const textStyle = buildTextStyle({
        font,
        weight,
        size,
        color: resolvedColor,
        align,
        style,
    })

    if (tag === 'link') {
        return (
            <Link
                style={textStyle}
                {...(rest as ComponentProps<typeof Link>)}
            />
        )
    }

    return <Text style={textStyle} {...(rest as TextProps)} />
}
