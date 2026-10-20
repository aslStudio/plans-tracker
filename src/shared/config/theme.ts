/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native'

export const Colors = {
    light: {
        accent: {
            turquoise: 'rgba(8, 127, 120, 1)',
            red: 'rgba(255, 56, 60, 1)',
            orange: 'rgba(255, 141, 40, 1)',
            yellow: 'rgba(255, 204, 0, 1)',
            green: 'rgba(52, 199, 89, 1)',
            blue: 'rgba(0, 136, 255, 1)',
            indigo: 'rgba(97, 85, 245, 1)',
            pink: 'rgba(255, 45, 85, 1)',
            softPink: 'rgba(247, 110, 244, 1)',
        },
        accentSecondary: {
            turquoise: 'rgba(8, 127, 120, 0.12)',
            red: 'rgba(255, 56, 60, 0.1)',
            orange: 'rgba(255, 141, 40, 0.1)',
            yellow: 'rgba(255, 204, 0, 0.1)',
            green: 'rgba(52, 199, 89, 0.1)',
            blue: 'rgba(0, 136, 255, 0.1)',
            indigo: 'rgba(97, 85, 245, 0.1)',
            pink: 'rgba(255, 45, 85, 0.1)',
            softPink: 'rgba(247, 110, 244, 0.1)',
        },
        background: {
            primary: 'rgba(255, 255, 255, 1)',
            secondary: 'rgba(242, 248, 246, 1)',
            elevated: 'rgba(255, 255, 255, 1)',
        },
        backgroundGrouped: {
            primary: 'rgba(242, 248, 246, 1)',
            secondary: 'rgba(255, 255, 255, 1)',
            elevated: 'rgba(242, 248, 246, 1)',
        },
        fill: {
            tertiary: 'rgba(118, 118, 128, 0.12)',
        },
        gray: {
            black: 'rgba(10, 22, 23, 1)',
            white: 'rgba(255, 255, 255, 1)',
            gray: 'rgba(142, 142, 147, 1)',
        },
        labels: {
            primary: 'rgba(10, 22, 23, 1)',
            secondary: 'rgba(61, 82, 80, 0.9)',
            tertiary: 'rgba(87, 108, 106, 0.8)',
        },
        miscellaneous: {
            segmentControl: 'rgba(255, 255, 255, 1)',
            bgDestructive: 'rgba(255, 56, 60, 0.14)',
        },
        separator: {
            opaque: 'rgba(216, 230, 225, 1)',
        },
    },
    dark: {
        accent: {
            turquoise: 'rgba(83, 219, 202, 1)',
            red: 'rgba(255, 66, 69, 1)',
            orange: 'rgba(255, 146, 48, 1)',
            yellow: 'rgba(255, 214, 0, 1)',
            green: 'rgba(48, 209, 88, 1)',
            blue: 'rgba(0, 145, 255, 1)',
            indigo: 'rgba(109, 124, 255, 1)',
            pink: 'rgba(255, 55, 95, 1)',
            softPink: 'rgba(240, 127, 238, 1)',
        },
        accentSecondary: {
            turquoise: 'rgba(83, 219, 202, 0.18)',
            red: 'rgba(255, 66, 69, 0.2)',
            orange: 'rgba(255, 146, 48, 0.2)',
            yellow: 'rgba(255, 214, 0, 0.2)',
            green: 'rgba(48, 209, 88, 0.2)',
            blue: 'rgba(0, 145, 255, 0.2)',
            indigo: 'rgba(109, 124, 255, 0.2)',
            pink: 'rgba(255, 55, 95, 0.2)',
            softPink: 'rgba(240, 127, 238, 0.2)',
        },
        background: {
            primary: 'rgba(10, 22, 23, 1)',
            secondary: 'rgba(22, 38, 39, 1)',
            elevated: 'rgba(22, 38, 39, 1)',
        },
        backgroundGrouped: {
            primary: 'rgba(10, 22, 23, 1)',
            secondary: 'rgba(22, 38, 39, 1)',
            elevated: 'rgba(22, 38, 39, 1)',
        },
        fill: {
            tertiary: 'rgba(118, 118, 128, 0.24)',
        },
        gray: {
            black: 'rgba(10, 22, 23, 1)',
            white: 'rgba(255, 255, 255, 1)',
            gray: 'rgba(142, 142, 147, 1)',
        },
        labels: {
            primary: 'rgba(255, 255, 255, 1)',
            secondary: 'rgba(235, 235, 245, 0.7)',
            tertiary: 'rgba(235, 235, 245, 0.3)',
        },
        miscellaneous: {
            segmentControl: 'rgba(255, 255, 255, 0.27)',
            bgDestructive: 'rgba(255, 66, 69, 0.14)',
        },
        separator: {
            opaque: 'rgba(52, 76, 75, 1)',
        },
    },
} as const

export type AccentName = keyof typeof Colors.light.accent
export const AccentNameValues = Object.keys(Colors.light.accent) as AccentName[]
type Palette = typeof Colors.light
export type ThemeColor =
    | {
          [Group in keyof Palette]: `${Group}.${keyof Palette[Group] & string}`
      }[keyof Palette]
    | 'brand'
    | 'brandSecondary'

export function resolveThemeColor(
    theme: (typeof Colors.light | typeof Colors.dark) & {
        brand: string
        brandSecondary: string
    },
    token: ThemeColor,
): string {
    if (token === 'brand' || token === 'brandSecondary') return theme[token]
    const [group, name] = token.split('.') as [keyof Palette, string]
    return (theme[group] as Record<string, string>)[name]
}

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: 'system-ui',
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: 'ui-serif',
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: 'ui-rounded',
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: 'var(--font-display)',
        serif: 'var(--font-serif)',
        rounded: 'var(--font-rounded)',
        mono: 'var(--font-mono)',
    },
})

export const Spacing = {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
} as const
