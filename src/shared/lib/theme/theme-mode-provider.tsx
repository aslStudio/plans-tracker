import { t, useLanguage } from '@/shared/lib/i18n'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { Appearance } from 'react-native'

import { useColorScheme } from './use-color-scheme'

const STORAGE_KEY = 'plans-tracker.theme.mode'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorScheme = 'light' | 'dark'

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']

type ThemeModeContextValue = {
    themeMode: ThemeMode
    setThemeMode: (mode: ThemeMode) => void
    resolvedScheme: ColorScheme
    themeModeStorageError: string | null
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

export function ThemeModeProvider({ children }: PropsWithChildren) {
    const language = useLanguage()

    const systemScheme = useColorScheme()
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
    const [themeModeStorageError, setStorageError] = useState<string | null>(
        null,
    )
    const changed = useRef(false)
    const writes = useRef(Promise.resolve())

    useEffect(() => {
        let active = true
        AsyncStorage.getItem(STORAGE_KEY)
            .then((saved) => {
                if (
                    active &&
                    !changed.current &&
                    saved &&
                    THEME_MODES.includes(saved as ThemeMode)
                ) {
                    setThemeModeState(saved as ThemeMode)
                }
            })
            .catch(() => {
                if (active)
                    setStorageError(t('Не удалось загрузить сохранённую тему'))
            })
        return () => {
            active = false
        }
    }, [])

    const setThemeMode = useCallback(
        (mode: ThemeMode) => {
            // Recompute localized values when the app language changes.
            void language

            if (!THEME_MODES.includes(mode)) return
            changed.current = true
            setThemeModeState(mode)
            // Preserve selection order even when the user taps several modes quickly.
            writes.current = writes.current
                .then(() => AsyncStorage.setItem(STORAGE_KEY, mode))
                .then(() => setStorageError(null))
                .catch(() => setStorageError(t('Не удалось сохранить тему')))
        },
        [language],
    )

    const resolvedScheme: ColorScheme =
        themeMode === 'system'
            ? systemScheme === 'dark'
                ? 'dark'
                : 'light'
            : themeMode

    // NativeTabs' UITabBar (and other native UIKit chrome, e.g. alerts)
    // renders via the OS's own dynamic colors, not our React color props —
    // it only matches an explicit light/dark choice here if we override the
    // app's native trait collection to match. Without this, a user whose
    // device appearance differs from their in-app choice gets a tab bar
    // stuck in the device's scheme instead of the one they picked.
    useEffect(() => {
        Appearance.setColorScheme(
            themeMode === 'system' ? 'unspecified' : themeMode,
        )
    }, [themeMode])

    return (
        <ThemeModeContext
            value={{
                themeMode,
                setThemeMode,
                resolvedScheme,
                themeModeStorageError,
            }}
        >
            {children}
        </ThemeModeContext>
    )
}

export function useThemeMode() {
    const context = useContext(ThemeModeContext)
    if (!context)
        throw new Error('useThemeMode must be used within ThemeModeProvider')
    return context
}
