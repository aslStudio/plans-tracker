/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
import { Colors } from '@/shared/config/theme'
import { useThemeMode } from '@/shared/lib/theme/theme-mode-provider'

import { useAccent } from './accent-provider'

export function useTheme() {
    const { resolvedScheme, themeMode, setThemeMode, themeModeStorageError } =
        useThemeMode()
    const accent = useAccent()

    return {
        colors: {
            ...Colors[resolvedScheme],
            ...accent,
            brand: Colors[resolvedScheme].accent[accent.selectedAccent],
            brandSecondary:
                Colors[resolvedScheme].accentSecondary[accent.selectedAccent],
        },
        colorScheme: resolvedScheme,
        themeMode,
        setThemeMode,
        themeModeStorageError,
    }
}
