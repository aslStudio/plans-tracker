import { requireOptionalNativeModule } from 'expo-modules-core'

/** Today's due habits only — see `HabitsWidget.swift`'s own `HabitWidgetItem` for the decode side. */
export type WidgetHabitItem = {
    id: string
    title: string
    completed: boolean
}

/** One tap-to-complete toggle the widget applied optimistically and is waiting for the app to apply for real. */
export type PendingHabitToggle = {
    habitId: string
    completed: boolean
}

type HabitWidgetDataNativeModule = {
    /** Writes today's habit list + the all-habits streak to the App Group `UserDefaults` the widget reads from and reloads its timeline. */
    updateHabits(itemsJSON: string, streak: number): void
    clearWidgetData(): void
    /** Reads and clears whatever the widget's own tap-to-complete rows queued. */
    getPendingToggles(): Promise<string>
}

const nativeModule =
    requireOptionalNativeModule<HabitWidgetDataNativeModule>('HabitWidgetData')

/** No-op on Android/web — the Home Screen widget is iOS-only. `items` should be today's due habits only. */
export function updateHabitWidget(
    items: WidgetHabitItem[],
    streak: number,
): void {
    nativeModule?.updateHabits(JSON.stringify(items), Math.round(streak))
}

export function clearHabitWidgetData(): void {
    nativeModule?.clearWidgetData()
}

/**
 * `[]` on Android/web, or if nothing was queued. Call this once per sync
 * and apply every toggle it returns to `habitsRepository.setCompletion` —
 * the native side already cleared its copy, so a dropped result here would
 * lose that tap for good.
 */
export async function takePendingHabitToggles(): Promise<PendingHabitToggle[]> {
    if (!nativeModule) return []
    const json = await nativeModule.getPendingToggles()
    try {
        const parsed = JSON.parse(json) as PendingHabitToggle[]
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}
