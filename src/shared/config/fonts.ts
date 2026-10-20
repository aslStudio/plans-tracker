/**
 * Local fonts for Android and web. Metro selects fonts.ios.ts on iOS so these
 * assets are excluded from its bundle. Components reference the families below.
 * https://docs.expo.dev/versions/v57.0.0/sdk/font/
 */
import { useFonts } from 'expo-font'

export const TextFontFamily = {
    regular: 'SFProText-Regular',
    regularItalic: 'SFProText-RegularItalic',
    medium: 'SFProText-Medium',
    mediumItalic: 'SFProText-MediumItalic',
    semibold: 'SFProText-Semibold',
    semiboldItalic: 'SFProText-SemiboldItalic',
    bold: 'SFProText-Bold',
    boldItalic: 'SFProText-BoldItalic',
} as const

export const RoundedFontFamily = {
    regular: 'SFProRounded-Regular',
    medium: 'SFProRounded-Medium',
    semibold: 'SFProRounded-Semibold',
    bold: 'SFProRounded-Bold',
} as const

export const AppFontSources = {
    [TextFontFamily.regular]: require('@/assets/fonts/SF-Pro-Text-Regular.otf'),
    [TextFontFamily.regularItalic]: require('@/assets/fonts/SF-Pro-Text-RegularItalic.otf'),
    [TextFontFamily.medium]: require('@/assets/fonts/SF-Pro-Text-Medium.otf'),
    [TextFontFamily.mediumItalic]: require('@/assets/fonts/SF-Pro-Text-MediumItalic.otf'),
    [TextFontFamily.semibold]: require('@/assets/fonts/SF-Pro-Text-Semibold.otf'),
    [TextFontFamily.semiboldItalic]: require('@/assets/fonts/SF-Pro-Text-SemiboldItalic.otf'),
    [TextFontFamily.bold]: require('@/assets/fonts/SF-Pro-Text-Bold.otf'),
    [TextFontFamily.boldItalic]: require('@/assets/fonts/SF-Pro-Text-BoldItalic.otf'),

    [RoundedFontFamily.regular]: require('@/assets/fonts/SF-Pro-Rounded-Regular.otf'),
    [RoundedFontFamily.medium]: require('@/assets/fonts/SF-Pro-Rounded-Medium.otf'),
    [RoundedFontFamily.semibold]: require('@/assets/fonts/SF-Pro-Rounded-Semibold.otf'),
    [RoundedFontFamily.bold]: require('@/assets/fonts/SF-Pro-Rounded-Bold.otf'),
}

export function useAppFonts() {
    return useFonts(AppFontSources)
}
