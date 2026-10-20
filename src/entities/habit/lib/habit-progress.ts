import { getMemoryHistory, isDeletedDate } from '@/shared/lib/memory/history'
import type { Habit, HabitCompletion, WeekDay } from '@/shared/api'
import { addDays, toLocalDateString } from '@/shared/lib/date'

function daysBetween(fromDate: string, toDate: string): number {
    const [fy, fm, fd] = fromDate.split('-').map(Number)
    const [ty, tm, td] = toDate.split('-').map(Number)
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.round(
        (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / msPerDay,
    )
}

/**
 * Whether `habit`'s cadence actually asks for an occurrence on `date` — the
 * denominator for every completion-rate calculation below, so a daily habit
 * isn't penalized for a day a weekly one was never due. A date before the
 * habit even existed is never due, for any cadence — not just `custom`
 * (which needs the same `createdAt` anchor for its own N-day math anyway).
 */
export function isHabitDueOnDate(habit: Habit, date: string): boolean {
    const createdDate = habit.createdAt.slice(0, 10)
    const history = getMemoryHistory()
    if (isDeletedDate(date) && habit.createdAt <= (history.clearedAt ?? ''))
        return false
    if (date < createdDate) return false

    const [year, month, day] = date.split('-').map(Number)
    const jsDate = new Date(year, month - 1, day)

    switch (habit.repeat.type) {
        case 'daily':
            return true
        case 'weekly':
            return habit.repeat.daysOfWeek.includes(jsDate.getDay() as WeekDay)
        case 'monthly':
            return jsDate.getDate() === habit.repeat.dayOfMonth
        case 'custom':
            return (
                daysBetween(createdDate, date) % habit.repeat.everyNDays === 0
            )
    }
}

export type HabitDayState = 'done' | 'missed' | 'not-due' | 'future'

/** A single calendar cell's state — distinct from `TasksScreen`'s 3-state model since a habit is a plain per-day boolean, not several tasks that can be partially done. */
export function resolveHabitDayState(
    habit: Habit,
    completions: HabitCompletion[],
    date: string,
    today: string,
): HabitDayState {
    if (date > today) return 'future'
    if (isDeletedDate(date)) return 'not-due'
    if (!isHabitDueOnDate(habit, date)) return 'not-due'
    return completions.some((c) => c.occurrenceDate === date)
        ? 'done'
        : 'missed'
}

export type WeekStripDay = { date: string; state: HabitDayState }

/**
 * The current calendar week — Monday through Sunday, always the same 7
 * slots regardless of which weekday `today` falls on — for the row's own
 * mini history strip. A fixed week (not a rolling "last 7 days" window) so
 * the strip reads the same every time you open the app that week, instead
 * of shuffling one slot over every midnight.
 */
export function computeWeekStrip(
    habit: Habit,
    completions: HabitCompletion[],
    today: string,
): WeekStripDay[] {
    const [year, month, day] = today.split('-').map(Number)
    const daysSinceMonday = (new Date(year, month - 1, day).getDay() + 6) % 7
    const monday = addDays(today, -daysSinceMonday)

    const result: WeekStripDay[] = []
    for (let i = 0; i < 7; i++) {
        const date = addDays(monday, i)
        result.push({
            date,
            state: resolveHabitDayState(habit, completions, date, today),
        })
    }
    return result
}

/**
 * Consecutive due-days completed, walking back from today. Today itself
 * doesn't break a streak built on prior days just for not being done yet
 * (there's still time left in it) — every earlier due-but-incomplete day
 * does.
 */
export function computeCurrentStreak(
    habit: Habit,
    completions: HabitCompletion[],
    today: string,
): number {
    const anchor = getMemoryHistory().habits[habit.id]
    if (anchor && today <= anchor.through) return anchor.count
    const completedDates = new Set(completions.map((c) => c.occurrenceDate))
    const createdDate = habit.createdAt.slice(0, 10)
    let streak = 0
    let cursor = today
    let isToday = true

    while (cursor >= createdDate || (anchor && cursor >= anchor.through)) {
        if (anchor && cursor <= anchor.through) return streak + anchor.count
        if (isHabitDueOnDate(habit, cursor)) {
            if (completedDates.has(cursor)) streak += 1
            else if (!isToday) break
        }
        isToday = false
        cursor = addDays(cursor, -1)
    }

    return streak
}

/** `done`/`due` counts for every day of `monthDate`'s month up to (and including) today — future days aren't counted either way. */
export function computeMonthCompletionRate(
    habit: Habit,
    completions: HabitCompletion[],
    monthDate: Date,
    today: string,
): { done: number; due: number } {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const completedDates = new Set(completions.map((c) => c.occurrenceDate))

    let done = 0
    let due = 0
    for (let day = 1; day <= daysInMonth; day++) {
        const date = toLocalDateString(new Date(year, month, day))
        if (date > today || isDeletedDate(date)) continue
        if (isHabitDueOnDate(habit, date)) {
            due += 1
            if (completedDates.has(date)) done += 1
        }
    }
    return { done, due }
}

/** How many of `habits` are due on `date` and already done — the header's own at-a-glance ring. `date` is usually today, but works for any date (e.g. paging the summary to a nearby day). */
export function computeTodaySummary(
    habits: Habit[],
    completionsByHabitId: Record<string, HabitCompletion[]>,
    date: string,
): { done: number; total: number } {
    let done = 0
    let total = 0
    for (const habit of habits) {
        if (!isHabitDueOnDate(habit, date)) continue
        total += 1
        if (
            completionsByHabitId[habit.id]?.some(
                (c) => c.occurrenceDate === date,
            )
        )
            done += 1
    }
    return { done, total }
}

export type DaySummary = { date: string; done: number; total: number }

/**
 * Every date in a bounded window around `today` worth showing in the
 * swipeable progress summary — `today` itself always, even with nothing
 * due that day, plus any other day in the window with at least one habit
 * due. Bounded rather than infinite, same reasoning as the calendar's own
 * fallback-months-back limit — a daily habit is due forever, so without a
 * bound "days with habits" would never stop.
 */
export function computeSummaryDays(
    habits: Habit[],
    completionsByHabitId: Record<string, HabitCompletion[]>,
    today: string,
    daysBack = 14,
    daysForward = 14,
): DaySummary[] {
    const days: DaySummary[] = []
    for (let offset = -daysBack; offset <= daysForward; offset++) {
        const date = addDays(today, offset)
        const { done, total } = computeTodaySummary(
            habits,
            completionsByHabitId,
            date,
        )
        if (total > 0 || date === today) days.push({ date, done, total })
    }
    return days
}
