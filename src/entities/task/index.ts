export {
    isTaskCompleted,
    resolveTaskDays,
    isTaskOverdue,
    resolveDateLineText,
    groupTasksByDay,
    tasksOnDate,
} from './lib/task-grouping'
export type {
    TaskDayGroup,
    GroupedTasks,
    TaskOccurrence,
} from './lib/task-grouping'

export { actualizeTaskDates } from './lib/day-tasks'

export { computeTaskProgress, getTaskDayProgress } from './lib/task-progress'
export type { TaskDayProgress } from './lib/task-progress'

export { buildFutureAgenda, scanPastAgendaDays } from './lib/task-agenda'
export type { TaskAgendaDay } from './lib/task-agenda'

export {
    DEFAULT_TASK_SORT,
    TASK_SORT_FIELDS,
    TASK_SORT_FIELD_LABELS,
    nextSortOnFieldPress,
    hasAnyDateData,
    hasAnyPriorityData,
    sortTasks,
} from './lib/task-sort'
export type {
    TaskSortField,
    TaskSortDirection,
    TaskSort,
} from './lib/task-sort'

export { resolveNextStatusId } from './lib/status-cycle'

export { filterTasksByGroup } from './lib/filter-tasks-by-group'
export type { GroupFilterSelection } from './lib/filter-tasks-by-group'

export { resolveGroupLabel } from './lib/resolve-group-label'
export type { ResolvedGroupLabel } from './lib/resolve-group-label'

export { resolvePriorityLabel } from './lib/resolve-priority-label'
export type { ResolvedPriorityLabel } from './lib/resolve-priority-label'

export { earliestTaskMonth } from './lib/earliest-task-month'
