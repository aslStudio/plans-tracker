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

import { type AccentName, Colors } from '@/shared/config/theme'

import { updateWidgetAccent } from '../../../../modules/calendar-widget-data'

const STORAGE_KEY = 'plans-tracker.theme.accent'
const AccentContext = createContext<{
    selectedAccent: AccentName
    setAccentColor: (accent: AccentName) => void
    accentStorageError: string | null
} | null>(null)

export function AccentProvider({ children }: PropsWithChildren) {
    const language = useLanguage()

    const [selectedAccent, setSelectedAccent] = useState<AccentName>('turquoise')
    const [accentStorageError, setStorageError] = useState<string | null>(null)
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
                    Object.hasOwn(Colors.light.accent, saved)
                ) {
                    setSelectedAccent(saved as AccentName)
                }
            })
            .catch(() => {
                if (active)
                    setStorageError(t('Не удалось загрузить акцентный цвет'))
            })
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        updateWidgetAccent(
            Colors.light.accent[selectedAccent],
            Colors.dark.accent[selectedAccent],
        )
    }, [selectedAccent])

    const setAccentColor = useCallback(
        (accent: AccentName) => {
            // Recompute localized values when the app language changes.
            void language

            if (!Object.hasOwn(Colors.light.accent, accent)) return
            changed.current = true
            setSelectedAccent(accent)
            // Preserve selection order even when the user taps several colors quickly.
            writes.current = writes.current
                .then(() => AsyncStorage.setItem(STORAGE_KEY, accent))
                .then(() => setStorageError(null))
                .catch(() =>
                    setStorageError(t('Не удалось сохранить акцентный цвет')),
                )
        },
        [language],
    )

    return (
        <AccentContext
            value={{ selectedAccent, setAccentColor, accentStorageError }}
        >
            {children}
        </AccentContext>
    )
}

export function useAccent() {
    const context = useContext(AccentContext)
    if (!context)
        throw new Error('useAccent must be used within AccentProvider')
    return context
}
