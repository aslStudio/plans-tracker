import type {
    TaskCompletion,
    TaskGroup,
    TaskPriority,
    TaskStatus,
} from '@/shared/api'
import type { TaskOccurrence } from '@/entities/task'

export type DaySectionProps = {
    /** Just needs to be unique among sections rendered together — used to key each row's swipeable-coordinator registration. */
    sectionKey: string
    animated?: boolean
    title: string
    tasks: TaskOccurrence[]
    completions?: TaskCompletion[]
    dayDate: string
    statuses: TaskStatus[]
    groups: TaskGroup[]
    priorities: TaskPriority[]
    useGroups: boolean
    usePriority: boolean
    today: string
    alwaysShow: boolean
    onOpenTask: (id: string, occurrenceDate?: string) => void
    onCompleteTask: (id: string, occurrenceDate: string) => void
    onDeleteTask: (id: string) => void
    onAddTask: () => void
    /** Moves an overdue row's task to today — wired to the swipe-right "Обновить" action for any row that's actually overdue. A non-overdue row gets "Изменить" (`onOpenTask`) in that same slot instead. */
    onActualizeTask: (id: string) => void
    /** Cycles a row's status to the next one by `order` — the status circle's own tap target. */
    onAdvanceStatus: (id: string, occurrenceDate?: string) => void
}
