import type { Habit, HabitCompletion } from '@/shared/api'

export type HabitMonthProgressProps = {
    habit: Habit
    completions: HabitCompletion[]
    today: string
}
