import { t } from '@/shared/lib/i18n'
import { getMemoryHistory } from '@/shared/lib/memory/history'
import type {
    Habit,
    HabitCompletion,
    RepeatRule,
    Task,
    TaskCompletion,
    TaskStatus,
    WeekDay,
} from '@/shared/api'
import type { CalendarEvent } from '@/shared/api/calendar/model'
import { parseLocalDateString, toLocalDateString } from '@/shared/lib/date'

export const EVENT_COLORS = [
    '#087F78',
    '#339E89',
    '#D99539',
    '#D36B91',
    '#548CBF',
]
export function validDate(value: string) {
    return (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        toLocalDateString(parseLocalDateString(value)) === value
    )
}
export function occursOn(
    start: string,
    repeat: RepeatRule | null | undefined,
    date: string,
): boolean {
    if (date < start) return false
    const deletedThrough = getMemoryHistory().deletedThrough
    if (
        repeat &&
        deletedThrough &&
        date <= deletedThrough &&
        date < toLocalDateString(new Date())
    )
        return false
    if (!repeat) return date === start
    const d = parseLocalDateString(date)
    if (repeat.type === 'daily') return true
    if (repeat.type === 'weekly')
        return repeat.daysOfWeek.includes(d.getDay() as WeekDay)
    if (repeat.type === 'monthly') return d.getDate() === repeat.dayOfMonth
    const utc = (s: string) => {
        const [y, m, day] = s.split('-').map(Number)
        return Date.UTC(y, m - 1, day)
    }
    return (
        repeat.everyNDays > 0 &&
        Math.round((utc(date) - utc(start)) / 86400000) % repeat.everyNDays ===
            0
    )
}
export function eventOnDate(event: CalendarEvent, date: string) {
    return (
        (!event.until || date <= event.until) &&
        !event.excludedDates.includes(date) &&
        occursOn(event.date, event.repeat, date)
    )
}
export function validateEvent(event: CalendarEvent): string | null {
    if (!event.title.trim()) return t('Добавьте название')
    if (!validDate(event.date)) return t('Проверьте дату: ГГГГ-ММ-ДД')
    if (event.until && (!validDate(event.until) || event.until < event.date))
        return t('Окончание повторений должно быть не раньше начала')
    if (
        !Number.isInteger(event.startMinute) ||
        event.startMinute < 0 ||
        event.startMinute >= 1440
    )
        return t('Проверьте время начала')
    if (
        !Number.isInteger(event.duration) ||
        event.duration < 1 ||
        event.startMinute + event.duration > 1440
    )
        return t('Событие должно закончиться до конца дня')
    if (event.repeat?.type === 'weekly' && !event.repeat.daysOfWeek.length)
        return t('Выберите дни недели')
    if (
        event.repeat?.type === 'custom' &&
        (!Number.isInteger(event.repeat.everyNDays) ||
            event.repeat.everyNDays < 1)
    )
        return t('Интервал должен быть целым положительным числом')
    return null
}
export function timeLabel(minute: number) {
    return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}
export function parseTime(value: string): number | null {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
    const [h, m] = value.split(':').map(Number)
    return h * 60 + m
}
export function emptyEvent(date: string, startMinute = 540): CalendarEvent {
    return {
        id: '',
        title: '',
        date,
        startMinute,
        duration: Math.min(60, 1440 - startMinute),
        allDay: false,
        color: EVENT_COLORS[0],
        notes: '',
        location: '',
        repeat: null,
        until: null,
        excludedDates: [],
        link: null,
    }
}
export type AgendaItem = CalendarEvent & {
    source: 'event' | 'task' | 'habit'
    completed?: boolean
}
export type AgendaCompletionState = {
    taskStatuses?: TaskStatus[]
    taskCompletions?: TaskCompletion[]
    habitCompletions?: HabitCompletion[]
}
function isTaskCompleted(
    task: Task | undefined,
    date: string,
    state: AgendaCompletionState,
) {
    if (!task) return false
    if (task.repeat)
        return (
            state.taskCompletions?.some(
                (completion) =>
                    completion.taskId === task.id &&
                    completion.occurrenceDate === date,
            ) ?? false
        )
    return (
        state.taskStatuses?.some(
            (status) => status.id === task.statusId && status.isCompleted,
        ) ?? false
    )
}
function isHabitCompleted(
    habit: Habit | undefined,
    date: string,
    state: AgendaCompletionState,
) {
    return (
        habit != null &&
        (state.habitCompletions?.some(
            (completion) =>
                completion.habitId === habit.id &&
                completion.occurrenceDate === date,
        ) ??
            false)
    )
}
export function agendaForDate(
    events: CalendarEvent[],
    tasks: Task[],
    habits: Habit[],
    date: string,
    showTasks = true,
    showHabits = true,
    completionState: AgendaCompletionState = {},
): AgendaItem[] {
    const result: AgendaItem[] = events
        .filter(
            (e) =>
                eventOnDate(e, date) &&
                (e.link?.type !== 'task' || showTasks) &&
                (e.link?.type !== 'habit' || showHabits),
        )
        .map((e) => {
            const linked =
                e.link?.type === 'task'
                    ? tasks.find((t) => t.id === e.link?.id)
                    : habits.find((h) => h.id === e.link?.id)
            return {
                ...e,
                title: linked?.title ?? e.title,
                source: 'event',
                completed:
                    e.link?.type === 'task'
                        ? isTaskCompleted(
                              linked as Task | undefined,
                              date,
                              completionState,
                          )
                        : e.link?.type === 'habit'
                          ? isHabitCompleted(
                                linked as Habit | undefined,
                                date,
                                completionState,
                            )
                          : false,
            }
        })
    const linked = new Set(
        result
            .filter((e) => e.link)
            .map((e) => `${e.link!.type}:${e.link!.id}`),
    )
    if (showTasks)
        for (const task of tasks) {
            const start =
                task.startDate ??
                task.endDate ??
                toLocalDateString(new Date(task.createdAt))
            if (
                !start ||
                task.startMinute == null ||
                linked.has(`task:${task.id}`)
            )
                continue
            if (
                !(task.repeat
                    ? occursOn(start, task.repeat, date)
                    : start <= date && date <= (task.endDate ?? start))
            )
                continue
            result.push({
                ...emptyEvent(date, task.startMinute ?? 540),
                id: task.id,
                title: task.title,
                allDay: task.startMinute == null,
                duration: task.durationMinutes ?? 60,
                color: EVENT_COLORS[0],
                source: 'task',
                link: { type: 'task', id: task.id },
                completed: isTaskCompleted(task, date, completionState),
            })
        }
    if (showHabits)
        for (const habit of habits) {
            if (
                habit.startMinute == null ||
                linked.has(`habit:${habit.id}`) ||
                !occursOn(
                    toLocalDateString(new Date(habit.createdAt)),
                    habit.repeat,
                    date,
                )
            )
                continue
            result.push({
                ...emptyEvent(date, habit.startMinute),
                id: habit.id,
                title: habit.title,
                duration: habit.durationMinutes ?? 60,
                repeat: habit.repeat,
                color: EVENT_COLORS[1],
                source: 'habit',
                link: { type: 'habit', id: habit.id },
                completed: isHabitCompleted(habit, date, completionState),
            })
        }
    return result.sort((a, b) => a.startMinute - b.startMinute)
}
/** Connected overlap groups share a stable column count; touching edges do not overlap. */
export function layoutEvents(items: AgendaItem[]) {
    const sorted = items
        .map((e) => (e.allDay ? { ...e, startMinute: 0, duration: 1440 } : e))
        .sort(
            (a, b) => a.startMinute - b.startMinute || b.duration - a.duration,
        )
    const output: { event: AgendaItem; column: number; columns: number }[] = []
    let group: typeof output = []
    let ends: number[] = []
    let groupEnd = -1
    const flush = () => {
        group.forEach((item) => {
            item.columns = ends.length
        })
        output.push(...group)
        group = []
        ends = []
    }
    for (const event of sorted) {
        if (event.startMinute >= groupEnd) flush()
        let column = ends.findIndex((end) => end <= event.startMinute)
        if (column === -1) column = ends.length
        ends[column] = event.startMinute + Math.max(event.duration, 24)
        groupEnd = Math.max(...ends)
        group.push({ event, column, columns: 1 })
    }
    flush()
    return output
}

/** Dateless tasks and due habits without an occurrence in this day's calendar. */
export function unplannedForDate(
    events: CalendarEvent[],
    tasks: Task[],
    habits: Habit[],
    date: string,
    showTasks = true,
    showHabits = true,
    completionState: AgendaCompletionState = {},
): AgendaItem[] {
    const linked = new Set(
        events
            .filter((e) => eventOnDate(e, date) && e.link)
            .map((e) => `${e.link!.type}:${e.link!.id}`),
    )
    const taskItems: AgendaItem[] = showTasks
        ? tasks
              .filter(
                  (t) =>
                      t.startMinute == null &&
                      !linked.has(`task:${t.id}`) &&
                      (!t.repeat ||
                          occursOn(
                              t.startDate ??
                                  t.endDate ??
                                  toLocalDateString(new Date(t.createdAt)),
                              t.repeat,
                              date,
                          )),
              )
              .map((t) => ({
                  ...emptyEvent(date),
                  id: t.id,
                  title: t.title,
                  source: 'task',
                  duration: t.durationMinutes ?? 60,
                  repeat: t.repeat ?? null,
                  link: { type: 'task', id: t.id },
                  completed: isTaskCompleted(t, date, completionState),
              }))
        : []
    const habitItems: AgendaItem[] = showHabits
        ? habits
              .filter(
                  (h) =>
                      h.startMinute == null &&
                      occursOn(
                          toLocalDateString(new Date(h.createdAt)),
                          h.repeat,
                          date,
                      ) &&
                      !linked.has(`habit:${h.id}`),
              )
              .map((h) => ({
                  ...emptyEvent(date),
                  id: h.id,
                  title: h.title,
                  source: 'habit',
                  duration: h.durationMinutes ?? 60,
                  repeat: h.repeat,
                  color: EVENT_COLORS[1],
                  link: { type: 'habit', id: h.id },
                  completed: isHabitCompleted(h, date, completionState),
              }))
        : []
    return [...taskItems, ...habitItems]
}

export function draftFromUnplanned(
    item: AgendaItem,
    date: string,
    minute = 540,
): CalendarEvent {
    return {
        ...emptyEvent(date, minute),
        title: item.title,
        link: item.link,
        repeat: item.repeat,
        color: item.color,
        duration: Math.min(item.duration, 1440 - minute),
        notes: item.notes,
    }
}

/** Coordinates stay in window space; scroll offset is measured in the timeline's content. */
export function minuteAtDrop(
    x: number,
    y: number,
    viewport: { x: number; y: number; width: number; height: number },
    scrollOffset: number,
    hourHeight: number,
): number | null {
    if (
        x < viewport.x + 60 ||
        x > viewport.x + viewport.width - 16 ||
        y < viewport.y ||
        y > viewport.y + viewport.height
    )
        return null
    const minute = ((y - viewport.y + scrollOffset - 14) / hourHeight) * 60
    return Math.max(0, Math.min(1425, Math.round(minute / 15) * 15))
}
