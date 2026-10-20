import type { Language } from '@/shared/lib/i18n'
import type { HabitCategory, TaskGroup, TaskPriority } from '@/shared/api'
import type { AccentColor } from '@/shared/config/color'
import type { AccentName } from '@/shared/config/theme'
import type { ThemeMode } from '@/shared/lib/theme'

export type EntityDraft = { label: string; color: AccentColor | null }

/** Which screen opened Settings — narrows which sections are relevant there. `undefined` (e.g. onboarding deep links into a specific row) shows everything. */
export type SettingsScreenContext = 'tasks' | 'habits' | 'calendar'

export type SettingsScreenProps = {
    highlight?: string
    context?: SettingsScreenContext
    language?: Language
    onChangeLanguage?: (language: Language) => void
    themeMode: ThemeMode
    onChangeThemeMode: (mode: ThemeMode) => void
    taskDaysAhead?: number
    onChangeTaskDaysAhead?: (value: number) => void
    taskRecurrenceEnabled?: boolean
    onToggleTaskRecurrence?: (value: boolean) => void
    taskTimeEnabled?: boolean
    onToggleTaskTime?: (value: boolean) => void
    calendarOptions?: { showTasks: boolean; showHabits: boolean }
    onChangeCalendarOptions?: (patch: {
        showTasks?: boolean
        showHabits?: boolean
    }) => void
    onOpenMemory?: () => void
    onOpenNotifications?: () => void
    onDownloadLogs?: () => void
    onClearLogs?: () => void
    onResetApp?: () => void
    useGroups: boolean
    usePriority: boolean
    groups: TaskGroup[]
    priorities: TaskPriority[]
    /** Off by default, unlike the two above — most habits don't need a category. */
    useHabitCategories: boolean
    habitCategories: HabitCategory[]
    accentName: AccentName
    onClose: () => void
    onToggleGroups: (value: boolean) => void
    onTogglePriority: (value: boolean) => void
    onCreateGroup: (draft: { label: string; color: AccentColor }) => void
    onUpdateGroup: (
        id: string,
        draft: { label: string; color: AccentColor },
    ) => void
    onDeleteGroup: (id: string) => void
    onCreatePriority: (draft: EntityDraft) => void
    onUpdatePriority: (id: string, draft: EntityDraft) => void
    onDeletePriority: (id: string) => void
    onToggleHabitCategories: (value: boolean) => void
    onCreateHabitCategory: (draft: EntityDraft) => void
    onUpdateHabitCategory: (id: string, draft: EntityDraft) => void
    onDeleteHabitCategory: (id: string) => void
    onChangeAccent: (value: AccentName) => void
}
