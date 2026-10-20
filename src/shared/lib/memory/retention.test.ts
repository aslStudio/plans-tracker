import {
    cleanupPlan,
    formatBytes,
    inactiveIds,
    keys,
    monthBefore,
    utf8Bytes,
    type Collections,
} from './retention'
import { emptyHistory, setMemoryHistory } from './history'
import {
    computeAllHabitsStreak,
    computeCurrentStreak,
    isHabitDueOnDate,
} from '@/entities/habit'
import type { Habit, HabitCompletion } from '@/shared/api'
const habit: Habit = {
    id: 'h',
    title: 'Read',
    repeat: { type: 'daily' },
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
}
const completions: HabitCompletion[] = ['10', '11', '12', '13', '14'].map(
    (day) => ({
        id: day,
        habitId: 'h',
        occurrenceDate: `2026-09-${day}`,
        completedAt: `2026-09-${day}T12:00:00Z`,
    }),
)
function data(): Collections {
    return {
        ...Object.fromEntries(Object.values(keys).map((key) => [key, []])),
        [keys.habits]: [habit],
        [keys.habitCompletions]: completions,
    }
}
beforeEach(() => setMemoryHistory(emptyHistory))
afterEach(() => setMemoryHistory(emptyHistory))
it('uses calendar months and counts actual UTF-8 bytes', () => {
    expect(monthBefore('2026-03-31')).toBe('2026-02-28')
    expect(monthBefore('2024-03-31')).toBe('2024-02-29')
    expect(monthBefore('2026-01-31')).toBe('2025-12-31')
    expect(utf8Bytes('aЯ🔥')).toBe(7)
    expect(formatBytes(0)).toBe('0 Б')
})
it('keeps unfinished tasks, future plans and ongoing repetitions', () => {
    const base = {
        title: 'Task',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        endDate: '2026-01-01',
        statusId: 'status-done',
    }
    const state = data()
    state[keys.tasks] = [
        { ...base, id: 'done' },
        { ...base, id: 'overdue', statusId: 'status-todo' },
        { ...base, id: 'repeat', repeat: { type: 'daily' } },
        { ...base, id: 'recentlyDone', updatedAt: '2026-10-14' },
    ]
    state[keys.events] = [
        { id: 'past', date: '2026-01-01', repeat: null },
        { id: 'future', date: '2027-01-01', repeat: null },
        {
            id: 'recurring',
            date: '2026-01-01',
            repeat: { type: 'daily' },
            until: null,
        },
    ]
    const plan = cleanupPlan(state, emptyHistory, 'old', '2026-10-14')
    expect(plan.next[keys.tasks].map((item) => item.id)).toEqual([
        'overdue',
        'repeat',
        'recentlyDone',
    ])
    expect(plan.next[keys.events].map((item) => item.id)).toEqual([
        'future',
        'recurring',
    ])
    expect(plan.next[keys.habits]).toEqual([habit])
    expect(plan.history.deletedIds[keys.tasks]).toEqual(['done'])
})
it('preserves boundary streaks across old cleanup and reload', () => {
    const plan = cleanupPlan(data(), emptyHistory, 'old', '2026-10-14')
    expect(plan.history.global).toEqual({ count: 4, through: '2026-09-13' })
    setMemoryHistory(JSON.parse(JSON.stringify(plan.history)))
    const retained = plan.next[keys.habitCompletions] as HabitCompletion[]
    expect(computeAllHabitsStreak([habit], { h: retained }, '2026-09-14')).toBe(
        5,
    )
    expect(computeCurrentStreak(habit, retained, '2026-09-14')).toBe(5)
    expect(computeAllHabitsStreak([habit], { h: retained }, '2026-09-15')).toBe(
        5,
    )
    expect(computeAllHabitsStreak([habit], { h: retained }, '2026-09-16')).toBe(
        0,
    )
    expect(isHabitDueOnDate(habit, '2026-09-13')).toBe(false)
})
it('keeps the displayed series when everything is deleted, without double counting the same day', () => {
    const plan = cleanupPlan(data(), emptyHistory, 'all', '2026-09-14')
    setMemoryHistory(plan.history)
    expect(computeAllHabitsStreak([], {}, '2026-09-14')).toBe(5)
    expect(computeAllHabitsStreak([], {}, '2026-10-14')).toBe(5)
    expect(plan.next[keys.habits]).toEqual([])
    expect(plan.history.deletedIds[keys.habits]).toEqual(['h'])
    const newHabit = { ...habit, id: 'new', createdAt: '2027-01-01T10:00:00Z' }
    expect(isHabitDueOnDate(newHabit, '2027-01-01')).toBe(true)
})
it('does not erase an existing checkpoint when cleaning again with an older boundary', () => {
    const all = cleanupPlan(data(), emptyHistory, 'all', '2026-09-14')
    setMemoryHistory(all.history)
    const again = cleanupPlan(all.next, all.history, 'old', '2026-09-14')
    expect(again.history.global).toEqual(all.history.global)
    expect(again.history.habits).toEqual(all.history.habits)
})
it('only offers cold storage for safe inactive records', () => {
    expect([...inactiveIds(data(), '2026-10-01')[keys.tasks]]).toEqual([])
})
