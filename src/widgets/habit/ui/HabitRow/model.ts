import type { Habit, HabitCategory } from '@/shared/api'
import type { WeekStripDay } from '@/entities/habit'

export type HabitRowProps = {
    habit: Habit
    category?: HabitCategory
    isCompleted: boolean
    isDue: boolean
    completionActionLabel: string
    weekStrip: WeekStripDay[]
    onToggle: () => void
    onPress: () => void
}
