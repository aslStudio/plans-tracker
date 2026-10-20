import { TODO_STATUS_ID } from '@/shared/api'
import type { Task } from '@/shared/api'
import { addDays } from '@/shared/lib/date'

import { buildFutureAgenda, scanPastAgendaDays } from './task-agenda'

const TODAY = '2026-10-12'

function oneDayTask(id: string, date: string): Task {
    return {
        id,
        title: id,
        statusId: TODO_STATUS_ID,
        startDate: date,
        endDate: date,
        createdAt: TODAY,
        updatedAt: TODAY,
    }
}

describe('buildFutureAgenda', () => {
    it('always includes today, even with nothing due', () => {
        const days = buildFutureAgenda([], TODAY)
        expect(days[0]).toEqual({ date: TODAY, tasks: [] })
    })

    it('appends exactly one empty buffer day right after today when nothing is upcoming', () => {
        const days = buildFutureAgenda([], TODAY)
        expect(days).toEqual([
            { date: TODAY, tasks: [] },
            { date: addDays(TODAY, 1), tasks: [] },
        ])
    })

    it('skips empty days in between and moves the buffer to right after the last populated day', () => {
        const future = oneDayTask('a', addDays(TODAY, 5))
        const days = buildFutureAgenda([future], TODAY)

        expect(days.map((day) => day.date)).toEqual([
            TODAY,
            addDays(TODAY, 5),
            addDays(TODAY, 6),
        ])
        expect(days[1].tasks).toEqual([future])
        expect(days[2].tasks).toEqual([])
    })

    it('does not scan past maxDaysAhead', () => {
        const farFuture = oneDayTask('a', addDays(TODAY, 10))
        const days = buildFutureAgenda([farFuture], TODAY, 5)

        expect(days).toEqual([
            { date: TODAY, tasks: [] },
            { date: addDays(TODAY, 1), tasks: [] },
        ])
    })
})

describe('scanPastAgendaDays', () => {
    it('returns nothing when there are no tasks', () => {
        expect(scanPastAgendaDays([], TODAY, 30)).toEqual([])
    })

    it('skips empty days and returns only populated ones, oldest first', () => {
        const old = oneDayTask('old', addDays(TODAY, -10))
        const recent = oneDayTask('recent', addDays(TODAY, -2))
        const days = scanPastAgendaDays([old, recent], TODAY, 30)

        expect(days.map((day) => day.date)).toEqual([
            addDays(TODAY, -10),
            addDays(TODAY, -2),
        ])
    })

    it('never looks further back than maxDays', () => {
        const tooOld = oneDayTask('old', addDays(TODAY, -40))
        expect(scanPastAgendaDays([tooOld], TODAY, 30)).toEqual([])
    })
})
