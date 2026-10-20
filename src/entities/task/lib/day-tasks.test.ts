import { TODO_STATUS_ID } from '@/shared/api'

import { actualizeTaskDates } from './day-tasks'

const now = new Date().toISOString()

const task = {
    id: '1',
    title: 'Собрать чемодан',
    statusId: TODO_STATUS_ID,
    startDate: null as string | null,
    endDate: null as string | null,
    createdAt: now,
    updatedAt: now,
}

describe('actualizeTaskDates', () => {
    it('collapses a plain one-day task to today', () => {
        const overdue = {
            ...task,
            startDate: '2026-10-01',
            endDate: '2026-10-01',
        }
        expect(actualizeTaskDates(overdue, '2026-10-12')).toEqual({
            startDate: '2026-10-12',
            endDate: '2026-10-12',
        })
    })

    it('keeps the original start date for a ranged task, only pulling the end forward', () => {
        const ranged = {
            ...task,
            startDate: '2026-10-01',
            endDate: '2026-10-05',
        }
        expect(actualizeTaskDates(ranged, '2026-10-12')).toEqual({
            startDate: '2026-10-01',
            endDate: '2026-10-12',
        })
    })
})
