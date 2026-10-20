import type {
    Task,
    TaskCompletion,
    TaskGroup,
    TaskPriority,
    TaskStatus,
} from '@/shared/api'

export type TasksScreenProps = {
    tasks: Task[]
    taskCompletions?: TaskCompletion[]
    statuses: TaskStatus[]
    groups: TaskGroup[]
    priorities: TaskPriority[]
    /** App-wide setting — groups can be turned off entirely, independent of whether any have been created. */
    useGroups: boolean
    /** Same idea as `useGroups` — priority is an opt-in extension of the entity, off by default. */
    usePriority: boolean
    taskDaysAhead?: number
    isLoading?: boolean
    onAddTask: () => void
    onOpenTask: (taskId: string, occurrenceDate?: string) => void
    onCompleteTask: (taskId: string, occurrenceDate?: string) => void
    onDeleteTask: (taskId: string) => void
    /** Shared by the header's "Все задачи" button (always visible) and the one after the Tomorrow section (only shown once there's at least one task) — both open the same place. */
    onOpenStatistics?: () => void
    onOpenCalendar: () => void
    onOpenSettings: () => void
    /** Moves an overdue task to today — see `DaySectionProps.onActualizeTask`. */
    onActualizeTask: (taskId: string) => void
    onMoveTask?: (taskId: string, date: string, from: string) => void
    onAdvanceStatus: (taskId: string, occurrenceDate?: string) => void
}
