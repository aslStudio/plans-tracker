import type { Habit, HabitCategory, HabitCompletion } from '@/shared/api'

export type HabitsScreenProps = {
    habits: Habit[]
    categories: HabitCategory[]
    /** App-wide setting, off by default — most habits don't need a category. */
    useCategories: boolean
    completionsByHabitId: Record<string, HabitCompletion[]>
    isLoading?: boolean
    onAddHabit: () => void
    onOpenHabit: (habitId: string) => void
    onDeleteHabit: (habitId: string) => void
    onToggleCompletion: (habitId: string, date: string) => void
    onOpenSettings: () => void
    onOpenStatistics?: (categoryId?: string) => void
    onOpenStreak: () => void
}
