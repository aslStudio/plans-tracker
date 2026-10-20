import type { useTheme } from '@/shared/lib/theme/use-theme'

import type { ButtonVariant, ButtonView } from './model'

type ButtonTheme = ReturnType<typeof useTheme>

export function resolveButtonColors(
    theme: ButtonTheme,
    variant: ButtonVariant,
    view: ButtonView,
    isDisabled = false,
) {
    const colors = theme.colors
    const palettes = {
        brand: {
            primary: colors.brand,
            secondary: colors.brandSecondary,
            foreground: colors.brand,
            onPrimary: colors.gray.white,
        },
        destructive: {
            primary: colors.accent.red,
            secondary: colors.miscellaneous.bgDestructive,
            foreground: colors.accent.red,
            onPrimary: colors.gray.white,
        },
        neutral: {
            primary: colors.labels.primary,
            secondary: colors.fill.tertiary,
            foreground: colors.labels.primary,
            onPrimary: colors.background.primary,
        },
        /** Same surfaces as neutral, but text/icon stays gray-white regardless of variant. */
        overlay: {
            primary: colors.labels.primary,
            secondary: colors.fill.tertiary,
            foreground: colors.gray.white,
            onPrimary: colors.gray.white,
        },
        /** Flat grouped-background surface with primary-label text/icon, regardless of variant. */
        grouped: {
            primary: colors.backgroundGrouped.secondary,
            secondary: colors.backgroundGrouped.secondary,
            foreground: colors.labels.primary,
            onPrimary: colors.labels.primary,
        },
    }
    const palette = palettes[view]
    const backgroundColor = isDisabled
        ? colors.fill.tertiary
        : variant === 'plain'
          ? 'transparent'
          : palette[variant]

    return {
        foregroundColor: isDisabled
            ? colors.labels.tertiary
            : variant === 'primary'
              ? palette.onPrimary
              : palette.foreground,
        backgroundColor,
        /** Tertiary-filled surfaces (disabled, or neutral/secondary) get a background blur when not liquid glass. */
        isTertiaryFill: backgroundColor === colors.fill.tertiary,
    }
}
