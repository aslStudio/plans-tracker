import { t, getLocale } from '@/shared/lib/i18n'
import type {
    Habit,
    HabitCompletion,
    Task,
    TaskCompletion,
    TaskStatus,
} from '@/shared/api'
import type { CalendarEvent } from '@/shared/api/calendar/model'
import { addDays } from '@/shared/lib/date'
import { computeAllHabitsStreak, computeCurrentStreak } from '@/entities/habit'
import type { MemoryHistory } from './history'

export const keys = {
    tasks: 'plans-tracker.tasks',
    habits: 'plans-tracker.habits',
    events: 'plans-tracker.calendar-events',
    taskCompletions: 'plans-tracker.task-completions',
    habitCompletions: 'plans-tracker.habit-completions',
    statuses: 'plans-tracker.task-statuses',
    priorities: 'plans-tracker.task-priorities',
    groups: 'plans-tracker.task-groups',
    categories: 'plans-tracker.habit-categories',
} as const
export type StoredRecord = { id: string; [key: string]: unknown }
export type Collections = Record<string, StoredRecord[]>
export function monthBefore(today: string) {
    const [y, m, d] = today.split('-').map(Number)
    const last = new Date(y, m - 1, 0).getDate()
    const date = new Date(y, m - 2, Math.min(d, last))
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function inactiveIds(
    data: Collections,
    before: string,
): Record<string, Set<string>> {
    const done = new Set(
        ((data[keys.statuses] as TaskStatus[]) ?? [])
            .filter((s) => s.isCompleted)
            .map((s) => s.id),
    )
    done.add('status-done')
    return {
        [keys.tasks]: new Set(
            ((data[keys.tasks] as Task[]) ?? [])
                .filter(
                    (t) =>
                        !t.repeat &&
                        done.has(t.statusId) &&
                        (t.endDate ?? t.startDate ?? t.updatedAt.slice(0, 10)) <
                            before &&
                        t.updatedAt.slice(0, 10) < before,
                )
                .map((t) => t.id),
        ),
        [keys.events]: new Set(
            ((data[keys.events] as CalendarEvent[]) ?? [])
                .filter((e) =>
                    e.repeat
                        ? Boolean(e.until && e.until < before)
                        : e.date < before,
                )
                .map((e) => e.id),
        ),
    }
}
export function cleanupPlan(
    data: Collections,
    current: MemoryHistory,
    mode: 'all' | 'old',
    today: string,
) {
    const before = mode === 'all' ? addDays(today, 1) : monthBefore(today)
    const through = addDays(before, -1)
    const habits = (data[keys.habits] ?? []) as Habit[]
    const completions = (data[keys.habitCompletions] ?? []) as HabitCompletion[]
    const byHabit = Object.fromEntries(
        habits.map((h) => [
            h.id,
            completions.filter(
                (c) => c.habitId === h.id && c.occurrenceDate < before,
            ),
        ]),
    )
    // Asking for the first retained day with no completion calculates the exact boundary.
    const reference = mode === 'all' ? today : before
    const global = {
        through,
        count: computeAllHabitsStreak(habits, byHabit, reference),
    }
    const anchors = Object.fromEntries(
        habits.map((h) => [
            h.id,
            current.habits[h.id]?.through > through
                ? current.habits[h.id]
                : {
                      through,
                      count: computeCurrentStreak(h, byHabit[h.id], reference),
                  },
        ]),
    )
    const history: MemoryHistory = {
        clearedAt: new Date().toISOString(),
        firstDate:
            current.firstDate ??
            habits.reduce(
                (first, habit) =>
                    habit.createdAt.slice(0, 10) < first
                        ? habit.createdAt.slice(0, 10)
                        : first,
                today,
            ),
        global:
            current.global && current.global.through > through
                ? current.global
                : global,
        habits: { ...current.habits, ...anchors },
        deletedThrough:
            current.deletedThrough && current.deletedThrough > through
                ? current.deletedThrough
                : through,
        deletedIds: { ...current.deletedIds },
    }
    const inactive = inactiveIds(data, before)
    const next: Collections = {}
    let removed = 0
    for (const [key, records] of Object.entries(data)) {
        next[key] = records.filter((record) => {
            let remove = mode === 'all'
            if (mode === 'old') {
                remove = inactive[key]?.has(record.id) ?? false
                if (
                    key === keys.habitCompletions ||
                    key === keys.taskCompletions
                ) {
                    remove =
                        (record as HabitCompletion | TaskCompletion)
                            .occurrenceDate < before
                }
            }
            if (remove) removed++
            return !remove
        })
        if (
            [keys.tasks, keys.habits, keys.events].includes(
                key as typeof keys.tasks,
            )
        ) {
            const kept = new Set(next[key].map((item) => item.id))
            history.deletedIds[key] = [
                ...new Set([
                    ...(history.deletedIds[key] ?? []),
                    ...records.filter((r) => !kept.has(r.id)).map((r) => r.id),
                ]),
            ]
        }
    }
    return { next, history, removed }
}
export function utf8Bytes(value: string) {
    let bytes = 0
    for (const char of value) {
        const code = char.codePointAt(0)!
        bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4
    }
    return bytes
}
export function formatBytes(bytes: number) {
    if (bytes < 1024) return t('{0} Б', [bytes])
    if (bytes < 1024 * 1024)
        return t('{0} КБ', [
            (bytes / 1024).toLocaleString(getLocale(), {
                maximumFractionDigits: 1,
            }),
        ])
    return t('{0} МБ', [
        (bytes / (1024 * 1024)).toLocaleString(getLocale(), {
            maximumFractionDigits: 1,
        }),
    ])
}
