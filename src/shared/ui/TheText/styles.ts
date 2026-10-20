import { isLoaded } from 'expo-font'
import { Platform, type StyleProp, type TextStyle } from 'react-native'

import {
    DefaultTextSize,
    DefaultTextWeight,
    resolveFontFamily,
    TextSizeTokens,
    type TheTextFont,
    type TheTextSize,
    type TheTextWeight,
} from './model'

type BuildTextStyleParams = {
    font?: TheTextFont
    weight?: TheTextWeight
    size?: TheTextSize
    color: string
    align?: 'center' | 'left' | 'right'
    style?: StyleProp<TextStyle>
}

export function buildTextStyle({
    font,
    weight,
    size,
    color,
    align,
    style,
}: BuildTextStyleParams): StyleProp<TextStyle> {
    const sizeStyle =
        TextSizeTokens[size ?? DefaultTextSize] ??
        TextSizeTokens[DefaultTextSize]
    const fontFamily = resolveFontFamily(font, weight)

    const fontStyle: TextStyle =
        Platform.OS === 'ios'
            ? {
                  fontFamily,
                  fontWeight: weight ?? DefaultTextWeight,
                  fontStyle: font === 'italic' ? 'italic' : 'normal',
              }
            : isLoaded(fontFamily)
              ? { fontFamily }
              : {
                    fontWeight: weight ?? DefaultTextWeight,
                    fontStyle: font === 'italic' ? 'italic' : 'normal',
                }

    return [{ ...fontStyle, color, textAlign: align, ...sizeStyle }, style]
}
