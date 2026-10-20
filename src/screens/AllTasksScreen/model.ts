import type {
    Task,
    TaskCompletion,
    TaskGroup,
    TaskPriority,
    TaskStatus,
} from '@/shared/api'

export type AllTasksScreenProps = {
    isLoading?: boolean
    tasks: Task[]
    taskCompletions?: TaskCompletion[]
    statuses: TaskStatus[]
    groups: TaskGroup[]
    priorities: TaskPriority[]
    useGroups: boolean
    usePriority: boolean
    onClose: () => void
    onAddTask: (date: string) => void
    onOpenTask: (id: string, occurrenceDate?: string) => void
    onCompleteTask: (id: string, occurrenceDate?: string) => void
    onDeleteTask: (id: string) => void
    onActualizeTask: (id: string) => void
    onAdvanceStatus: (id: string, occurrenceDate?: string) => void
}
