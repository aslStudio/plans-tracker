import type { ReactNode } from 'react'

export type SwipeableTaskRowProps = {
    taskId: string
    /** Unique per *rendered instance*, not per task — a task due several days out can render in both "Сегодня" and "Завтра" at once, and each needs its own coordinator registration. Defaults to `taskId`. */
    instanceKey?: string
    isCompleted: boolean
    onComplete: () => void
    onDelete: () => void
    /** Available for every task, including overdue and completed tasks. */
    onEdit?: () => void
    children: ReactNode
}
