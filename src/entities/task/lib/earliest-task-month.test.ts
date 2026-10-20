import { earliestTaskMonth } from './earliest-task-month'

const now = new Date().toISOString()
const task = {
    id: '1',
    title: 'Собрать чемодан',
    statusId: 'status-todo',
    startDate: null as string | null,
    endDate: null as string | null,
    createdAt: now,
    updatedAt: now,
}

describe('earliestTaskMonth', () => {
    it('is null with no tasks at all', () => {
        expect(earliestTaskMonth([])).toBeNull()
    })

    it('is null when every task is dateless', () => {
        expect(earliestTaskMonth([task])).toBeNull()
    })

    it('is the 1st of the earliest month any task touches', () => {
        const a = {
            ...task,
            id: 'a',
            startDate: '2026-03-10',
            endDate: '2026-03-10',
        }
        const b = {
            ...task,
            id: 'b',
            startDate: '2025-11-01',
            endDate: '2025-11-05',
        }
        expect(earliestTaskMonth([a, b])).toEqual(new Date(2025, 10, 1))
    })
})
