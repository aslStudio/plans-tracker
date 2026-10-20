import {
    computeCurrentStreak,
    computeMonthCompletionRate,
    computeSummaryDays,
    computeTodaySummary,
    computeWeekStrip,
    isHabitDueOnDate,
    resolveHabitDayState,
} from './habit-progress'

const now = new Date().toISOString()

const dailyHabit = {
    id: 'h1',
    title: 'Пить воду',
    repeat: { type: 'daily' as const },
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: now,
}

const weeklyHabit = {
    id: 'h2',
    title: 'Тренировка',
    // Monday(1)/Wednesday(3)/Friday(5)
    repeat: { type: 'weekly' as const, daysOfWeek: [1, 3, 5] as [1, 3, 5] },
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: now,
}

function completion(habitId: string, occurrenceDate: string) {
    return {
        id: `c-${habitId}-${occurrenceDate}`,
        habitId,
        occurrenceDate,
        completedAt: now,
    }
}

describe('isHabitDueOnDate', () => {
    it('is always due for a daily habit', () => {
        expect(isHabitDueOnDate(dailyHabit, '2026-10-05')).toBe(true)
        expect(isHabitDueOnDate(dailyHabit, '2026-12-25')).toBe(true)
    })

    it('is due only on the configured weekdays for a weekly habit', () => {
        // 2026-10-12 is a Monday
        expect(isHabitDueOnDate(weeklyHabit, '2026-10-12')).toBe(true)
        expect(isHabitDueOnDate(weeklyHabit, '2026-10-13')).toBe(false)
        expect(isHabitDueOnDate(weeklyHabit, '2026-10-14')).toBe(true)
    })

    it('is due on the matching day of the month for a monthly habit', () => {
        const monthly = {
            ...dailyHabit,
            repeat: { type: 'monthly' as const, dayOfMonth: 15 },
        }
        expect(isHabitDueOnDate(monthly, '2026-10-15')).toBe(true)
        expect(isHabitDueOnDate(monthly, '2026-10-16')).toBe(false)
    })

    it('is due every N days from creation for a custom habit', () => {
        const custom = {
            ...dailyHabit,
            createdAt: '2026-10-01T00:00:00.000Z',
            repeat: { type: 'custom' as const, everyNDays: 3 },
        }
        expect(isHabitDueOnDate(custom, '2026-10-01')).toBe(true)
        expect(isHabitDueOnDate(custom, '2026-10-02')).toBe(false)
        expect(isHabitDueOnDate(custom, '2026-10-04')).toBe(true)
    })

    it('is never due before the habit was created, regardless of cadence', () => {
        // dailyHabit was created 2026-10-01 — a date before that is never due
        // even though "daily" would otherwise say yes every day.
        expect(isHabitDueOnDate(dailyHabit, '2026-09-30')).toBe(false)

        // weeklyHabit is Mon/Wed/Fri; 2026-09-28 is a Monday, before creation.
        expect(isHabitDueOnDate(weeklyHabit, '2026-09-28')).toBe(false)

        const monthly = {
            ...dailyHabit,
            repeat: { type: 'monthly' as const, dayOfMonth: 15 },
        }
        expect(isHabitDueOnDate(monthly, '2026-09-15')).toBe(false)
    })
})

describe('computeWeekStrip', () => {
    it('returns the Monday-first week containing today, each day with its own state', () => {
        // 2026-10-12 is a Monday — the week runs through 2026-10-18 (Sunday).
        const completions = [completion('h1', '2026-10-12')]
        const strip = computeWeekStrip(dailyHabit, completions, '2026-10-12')

        expect(strip.map((d) => d.date)).toEqual([
            '2026-10-12',
            '2026-10-13',
            '2026-10-14',
            '2026-10-15',
            '2026-10-16',
            '2026-10-17',
            '2026-10-18',
        ])
        expect(strip[0]).toEqual({ date: '2026-10-12', state: 'done' })
        // Later days in the same week, not reached yet, are "future" rather
        // than looking like a missed day.
        expect(strip[1]).toEqual({ date: '2026-10-13', state: 'future' })
    })

    it('returns the same week no matter which weekday today falls on', () => {
        // 2026-10-14 is a Wednesday, inside the same Mon 10-12 .. Sun 10-18 week.
        const strip = computeWeekStrip(dailyHabit, [], '2026-10-14')

        expect(strip[0].date).toBe('2026-10-12')
        expect(strip[6].date).toBe('2026-10-18')
    })
})

describe('computeCurrentStreak', () => {
    it('counts consecutive completed due-days backward from today', () => {
        const completions = ['2026-10-10', '2026-10-11', '2026-10-12'].map(
            (d) => completion('h1', d),
        )
        expect(
            computeCurrentStreak(dailyHabit, completions, '2026-10-12'),
        ).toBe(3)
    })

    it('does not break the streak just because today itself is not done yet', () => {
        const completions = ['2026-10-10', '2026-10-11'].map((d) =>
            completion('h1', d),
        )
        expect(
            computeCurrentStreak(dailyHabit, completions, '2026-10-12'),
        ).toBe(2)
    })

    it('breaks the streak at the first earlier missed due-day', () => {
        const completions = ['2026-10-12'].map((d) => completion('h1', d))
        // 2026-10-11 was due and not completed -> streak stops there
        expect(
            computeCurrentStreak(dailyHabit, completions, '2026-10-12'),
        ).toBe(1)
    })
})

describe('resolveHabitDayState', () => {
    it('is "future" for a date after today', () => {
        expect(
            resolveHabitDayState(dailyHabit, [], '2026-10-20', '2026-10-12'),
        ).toBe('future')
    })

    it('is "not-due" for a date the habit does not ask for', () => {
        expect(
            resolveHabitDayState(weeklyHabit, [], '2026-10-13', '2026-10-13'),
        ).toBe('not-due')
    })

    it('is "done" when completed, "missed" otherwise, for a due date', () => {
        const completions = [completion('h1', '2026-10-12')]
        expect(
            resolveHabitDayState(
                dailyHabit,
                completions,
                '2026-10-12',
                '2026-10-12',
            ),
        ).toBe('done')
        expect(
            resolveHabitDayState(dailyHabit, [], '2026-10-11', '2026-10-12'),
        ).toBe('missed')
    })

    it('is "not-due" rather than "missed" for a date before the habit was created', () => {
        // dailyHabit was created 2026-10-01 — nothing before that counts
        // as a missed day even though "daily" is otherwise due every day.
        expect(
            resolveHabitDayState(dailyHabit, [], '2026-09-30', '2026-10-12'),
        ).toBe('not-due')
    })
})

describe('computeMonthCompletionRate', () => {
    it('counts only due days up to today, not future days', () => {
        const completions = ['2026-10-01', '2026-10-02', '2026-10-03'].map(
            (d) => completion('h1', d),
        )
        const { done, due } = computeMonthCompletionRate(
            dailyHabit,
            completions,
            new Date(2026, 9, 1),
            '2026-10-05',
        )
        expect(due).toBe(5) // Oct 1-5
        expect(done).toBe(3)
    })

    it('does not count days before the habit was created as missed', () => {
        // Created on the 10th — the 1st-9th of the same month must not
        // count towards "due" at all, let alone as missed.
        const habit = { ...dailyHabit, createdAt: '2026-10-10T00:00:00.000Z' }
        const { done, due } = computeMonthCompletionRate(
            habit,
            [],
            new Date(2026, 9, 1),
            '2026-10-15',
        )
        expect(due).toBe(6) // Oct 10-15
        expect(done).toBe(0)
    })
})

describe('computeTodaySummary', () => {
    it('only counts habits actually due today', () => {
        const completionsByHabitId = { h1: [completion('h1', '2026-10-12')] }
        // 2026-10-12 is a Monday, so weeklyHabit (Mon/Wed/Fri) is also due
        const { done, total } = computeTodaySummary(
            [dailyHabit, weeklyHabit],
            completionsByHabitId,
            '2026-10-12',
        )
        expect(total).toBe(2)
        expect(done).toBe(1)
    })
})

describe('computeSummaryDays', () => {
    it('includes today even with nothing due, plus any other day in the window with something due', () => {
        // weeklyHabit is Mon/Wed/Fri; within Oct 9-15, that's the 9th, 12th (today), and 14th.
        const days = computeSummaryDays([weeklyHabit], {}, '2026-10-12', 3, 3)

        expect(days.map((d) => d.date)).toEqual([
            '2026-10-09',
            '2026-10-12',
            '2026-10-14',
        ])
        expect(days.every((d) => d.total === 1 && d.done === 0)).toBe(true)
    })

    it('reflects completions for each day independently', () => {
        const completionsByHabitId = { h2: [completion('h2', '2026-10-14')] }
        const days = computeSummaryDays(
            [weeklyHabit],
            completionsByHabitId,
            '2026-10-12',
            3,
            3,
        )

        expect(days.find((d) => d.date === '2026-10-12')).toEqual({
            date: '2026-10-12',
            done: 0,
            total: 1,
        })
        expect(days.find((d) => d.date === '2026-10-14')).toEqual({
            date: '2026-10-14',
            done: 1,
            total: 1,
        })
    })
})
