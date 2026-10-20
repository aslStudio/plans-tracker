import {
    DEFAULT_TASK_SORT,
    filterTasksByGroup,
    sortTasks,
    type TaskAgendaDay,
    type TaskOccurrence,
    type TaskSort,
    type GroupFilterSelection,
} from '@/entities/task'
import type { TaskStatus, TaskPriority } from '@/shared/api'

export type DayPreferences = { sort: TaskSort; group: GroupFilterSelection }
export const DEFAULT_DAY_PREFERENCES: DayPreferences = {
    sort: DEFAULT_TASK_SORT,
    group: 'all',
}
export type AgendaCell =
    | {
          key: string
          type: 'header'
          day: TaskAgendaDay
          preferences: DayPreferences
      }
    | {
          key: string
          type: 'task'
          date: string
          task: TaskOccurrence
          first: boolean
          last: boolean
      }
    | { key: string; type: 'empty'; date: string; filtered: boolean }

/** Keep every row's identity across pagination, not just the whole day. */
export function createAgendaCells(
    statuses: TaskStatus[],
    priorities: TaskPriority[],
) {
    const cache = new WeakMap<
        TaskAgendaDay,
        { preferences: DayPreferences; cells: AgendaCell[] }
    >()
    return (day: TaskAgendaDay, preferences: DayPreferences): AgendaCell[] => {
        const saved = cache.get(day)
        if (saved?.preferences === preferences) return saved.cells
        const tasks = sortTasks(
            filterTasksByGroup(day.tasks, preferences.group),
            statuses,
            priorities,
            preferences.sort,
        ) as TaskOccurrence[]
        const cells: AgendaCell[] = [
            { key: `${day.date}:header`, type: 'header', day, preferences },
        ]
        tasks.forEach((task, index) =>
            cells.push({
                key: `${day.date}:task:${task.id}`,
                type: 'task',
                date: day.date,
                task,
                first: index === 0,
                last: index === tasks.length - 1,
            }),
        )
        if (!tasks.length)
            cells.push({
                key: `${day.date}:empty`,
                type: 'empty',
                date: day.date,
                filtered: day.tasks.length > 0,
            })
        cache.set(day, { preferences, cells })
        return cells
    }
}
