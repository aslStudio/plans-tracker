import type { ReactNode } from 'react'

export type SwipeableHabitRowProps = {
    habitId: string
    onDelete: () => void
    children: ReactNode
}
