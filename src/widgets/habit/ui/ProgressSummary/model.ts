import type { Habit, HabitCompletion } from '@/shared/api'

export type ProgressSummaryProps = {
    habits: Habit[]
    completionsByHabitId: Record<string, HabitCompletion[]>
    today: string
}
