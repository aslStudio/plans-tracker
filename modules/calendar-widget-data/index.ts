import { requireOptionalNativeModule } from 'expo-modules-core'

/**
 * One concrete calendar-date occurrence — already resolved from any
 * recurrence rule to a specific date by the JS side (same shape
 * `agendaForDate` produces for one day), see
 * `CalendarWidget.swift`'s own `AgendaItem` for the decode side.
 */
export type WidgetAgendaItem = {
    title: string
    /** Local date, `"YYYY-MM-DD"`. */
    date: string
    startMinute: number
    duration: number
    allDay: boolean
    /** Raw hex, e.g. `"#087F78"` — the event's own color. */
    color: string
    /** Derived tasks/habits inherit the selected app accent. */
    useAppAccent?: boolean
    completed: boolean
}

type CalendarWidgetDataNativeModule = {
    /** Writes the upcoming-agenda window to the App Group `UserDefaults` the widget reads from and reloads its timeline. */
    updateAgenda(agendaJSON: string): void
    updateLanguage?(language: string): void
    updateAccent?(light: string, dark: string): void
    clearWidgetData(): void
}

const nativeModule =
    requireOptionalNativeModule<CalendarWidgetDataNativeModule>(
        'CalendarWidgetData',
    )

export function clearCalendarWidgetData(): void {
    nativeModule?.clearWidgetData()
}

/**
 * No-op on Android/web — the Home Screen widget is iOS-only. `items` should
 * span today through the next several days (recurrence already expanded),
 * in no particular order — the widget itself filters to "not yet elapsed"
 * and sorts at render time, see `CalendarWidget.swift`'s own `upcoming`.
 */
export function updateCalendarWidget(items: WidgetAgendaItem[]): void {
    nativeModule?.updateAgenda(JSON.stringify(items))
}

export function updateWidgetAccent(light: string, dark: string): void {
    nativeModule?.updateAccent?.(light, dark)
}

export function updateWidgetLanguage(language: string): void {
    nativeModule?.updateLanguage?.(language)
}
