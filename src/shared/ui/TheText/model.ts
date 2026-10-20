import type { Link } from 'expo-router'
import type { ComponentProps } from 'react'
import type { TextProps } from 'react-native'

import type { Color } from '@/shared/config/color'
import { RoundedFontFamily, TextFontFamily } from '@/shared/config/fonts'

export type TheTextTag = 'text' | 'link'
export type TheTextFont = 'base' | 'rounded' | 'italic'
export type TheTextWeight = '400' | '500' | '600' | '700'
export type TheTextSize =
    | 'large-title'
    | 'title-1'
    | 'title-2'
    | 'title-3'
    | 'body'
    | 'subheadline'
    | 'subtitle-2'
    | 'footnote'
    | 'caption-1'
    | 'caption-2'
    | 'amount'
    | 'callout'
type SharedProps = {
    size?: TheTextSize
    weight?: TheTextWeight
    font?: TheTextFont
    color?: Color
    align?: 'center' | 'left' | 'right'
}

type TheTextAsText = { tag?: 'text' } & TextProps
type TheTextAsLink = { tag: 'link' } & ComponentProps<typeof Link>

export type TheTextProps = SharedProps & (TheTextAsText | TheTextAsLink)

/**
 * Placeholder scale based on iOS HIG text styles. Replace with the design's
 * real size tokens once they're specced — `size` accepts any string, unknown
 * keys fall back to `DefaultTextSize`.
 */
export const TextSizeTokens: Record<
    TheTextSize,
    { fontSize: number; lineHeight: number }
> = {
    ['large-title']: { fontSize: 64, lineHeight: 68 },
    ['title-1']: { fontSize: 28, lineHeight: 34 },
    ['title-2']: { fontSize: 22, lineHeight: 28 },
    ['title-3']: { fontSize: 20, lineHeight: 25 },
    body: { fontSize: 17, lineHeight: 22 },
    subheadline: { fontSize: 15, lineHeight: 20 },
    ['subtitle-2']: { fontSize: 14, lineHeight: 18 },
    footnote: { fontSize: 13, lineHeight: 18 },
    ['caption-1']: { fontSize: 12, lineHeight: 16 },
    ['caption-2']: { fontSize: 11, lineHeight: 13 },
    amount: { fontSize: 40, lineHeight: 40 },
    callout: { fontSize: 16, lineHeight: 21 },
}

const FontFamilyByWeight: Record<TheTextFont, Record<string, string>> = {
    base: {
        regular: TextFontFamily.regular,
        medium: TextFontFamily.medium,
        semibold: TextFontFamily.semibold,
        bold: TextFontFamily.bold,
    },
    italic: {
        regular: TextFontFamily.regularItalic,
        medium: TextFontFamily.mediumItalic,
        semibold: TextFontFamily.semiboldItalic,
        bold: TextFontFamily.boldItalic,
    },
    rounded: {
        regular: RoundedFontFamily.regular,
        medium: RoundedFontFamily.medium,
        semibold: RoundedFontFamily.semibold,
        bold: RoundedFontFamily.bold,
    },
}

/** CSS-style numeric weight tokens mapped onto each platform's font families. */
const FontKeyByWeight: Record<TheTextWeight, string> = {
    '400': 'regular',
    '500': 'medium',
    '600': 'semibold',
    '700': 'bold',
}

export const DefaultTextSize: TheTextSize = 'body'
export const DefaultTextWeight: TheTextWeight = '400'
export const DefaultTextFont: TheTextFont = 'base'
export const DefaultTextColor: Color = 'labels-primary'

export const TextSizeValues = Object.keys(TextSizeTokens) as TheTextSize[]
export const TextWeightValues = Object.keys(FontKeyByWeight) as TheTextWeight[]
export const TextFontValues: TheTextFont[] = ['base', 'rounded', 'italic']
export const TextColorValues: Color[] = [
    'brand',
    'brandSecondary',
    'accent-turquoise',
    'accent-red',
    'accent-orange',
    'accent-yellow',
    'accent-green',
    'accent-blue',
    'accent-indigo',
    'accent-pink',
    'labels-primary',
    'labels-secondary',
    'labels-tertiary',
    'gray-black',
    'gray-white',
    'gray-gray',
    'background-primary',
    'background-secondary',
    'background-elevated',
]

export function resolveFontFamily(
    font: TheTextFont = DefaultTextFont,
    weight: TheTextWeight = DefaultTextWeight,
): string {
    const weights =
        FontFamilyByWeight[font] ?? FontFamilyByWeight[DefaultTextFont]
    const key = FontKeyByWeight[weight] ?? FontKeyByWeight[DefaultTextWeight]
    return weights[key] ?? weights[FontKeyByWeight[DefaultTextWeight]]
}

/** Theme shape `resolveTextColor` needs — kept minimal so `model.ts` doesn't depend on the theme hook. */
export type ThemeColorSource = {
    brand: string
    brandSecondary: string
    accent: Record<string, string>
    labels: Record<string, string>
    gray: Record<string, string>
    background: Record<string, string>
}

export function resolveTextColor(
    theme: ThemeColorSource,
    color: Color = DefaultTextColor,
): string {
    if (color === 'brand' || color === 'brandSecondary') return theme[color]
    if (color.startsWith('gray-')) {
        const name = color.slice('gray-'.length)
        return theme.gray[name] ?? theme.gray.gray
    }
    if (color.startsWith('background-')) {
        const name = color.slice('background-'.length)
        return theme.background[name] ?? theme.background.primary
    }
    if (color.startsWith('accent-')) {
        const name = color.slice('accent-'.length)
        return theme.accent[name] ?? theme.brand
    }
    const name = color.slice('labels-'.length)
    return theme.labels[name] ?? theme.labels.primary
}
