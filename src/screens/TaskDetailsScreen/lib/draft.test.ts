import { DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'

import {
    normalizeTaskDraftPatch,
    createEmptyDraft,
    draftToCreateInput,
    isBlankDraft,
    taskToDraft,
} from './draft'

const now = new Date().toISOString()

describe('createEmptyDraft', () => {
    it('defaults to the todo status, starting today, with every other optional field unset', () => {
        expect(createEmptyDraft()).toEqual({
            title: '',
            note: '',
            description: '',
            statusId: TODO_STATUS_ID,
            groupId: null,
            priorityId: null,
            startMinute: null,
            durationMinutes: 60,
            startDate: todayDateString(),
            endDate: null,
            repeat: null,
        })
    })

    it('uses the prefilled date for both start and end when opened from a specific day', () => {
        const draft = createEmptyDraft('2026-10-20')

        expect(draft.startDate).toBe('2026-10-20')
        expect(draft.endDate).toBe('2026-10-20')
    })
})

describe('taskToDraft', () => {
    it('falls back to null/empty for every optional field a task omits', () => {
        const draft = taskToDraft({
            id: '1',
            title: 'Собрать чемодан',
            statusId: TODO_STATUS_ID,
            createdAt: now,
            updatedAt: now,
        })

        expect(draft).toEqual({
            title: 'Собрать чемодан',
            note: '',
            description: '',
            statusId: TODO_STATUS_ID,
            groupId: null,
            priorityId: null,
            startMinute: null,
            durationMinutes: 60,
            startDate: null,
            endDate: null,
            repeat: null,
        })
    })

    it('carries over every field a task actually has', () => {
        const draft = taskToDraft({
            id: '1',
            title: 'Собрать чемодан',
            note: '',
            description: '<p>Паспорт</p>',
            statusId: 'status-blocked',
            groupId: 'group-work',
            priorityId: 'priority-high',
            startMinute: 557,
            durationMinutes: 43,
            startDate: '2026-10-10',
            endDate: '2026-10-12',
            repeat: null,
            createdAt: now,
            updatedAt: now,
        })

        expect(draft).toEqual({
            title: 'Собрать чемодан',
            note: '',
            description: '<p>Паспорт</p>',
            statusId: 'status-blocked',
            groupId: 'group-work',
            priorityId: 'priority-high',
            startMinute: 557,
            durationMinutes: 43,
            startDate: '2026-10-10',
            endDate: '2026-10-12',
            repeat: null,
        })
    })
})

describe('draftToCreateInput', () => {
    it('maps every draft field onto the create input 1:1', () => {
        const draft = taskToDraft({
            id: '1',
            title: 'Собрать чемодан',
            statusId: TODO_STATUS_ID,
            groupId: 'group-work',
            createdAt: now,
            updatedAt: now,
        })

        expect(draftToCreateInput(draft)).toEqual({
            title: 'Собрать чемодан',
            note: '',
            description: '',
            statusId: TODO_STATUS_ID,
            groupId: 'group-work',
            priorityId: null,
            startMinute: null,
            durationMinutes: 60,
            startDate: null,
            endDate: null,
            repeat: null,
        })
    })
})

describe('isBlankDraft', () => {
    it('is true for an empty or whitespace-only title', () => {
        expect(isBlankDraft(createEmptyDraft())).toBe(true)
        expect(isBlankDraft({ ...createEmptyDraft(), title: '   ' })).toBe(true)
    })

    it('is false once there is a real title', () => {
        expect(
            isBlankDraft({ ...createEmptyDraft(), title: 'Собрать чемодан' }),
        ).toBe(false)
    })
})

it('loads the status of the opened repeat date, including custom statuses', () => {
    const task = {
        id: 'daily',
        title: 'Daily',
        statusId: TODO_STATUS_ID,
        repeat: { type: 'daily' as const },
        createdAt: now,
        updatedAt: now,
        occurrenceStatusIds: { '2026-10-17': 'in-progress' },
    }
    const completions = [
        {
            id: 'done',
            taskId: task.id,
            occurrenceDate: '2026-10-15',
            completedAt: now,
        },
    ]
    expect(taskToDraft(task, '2026-10-15', completions).statusId).toBe(
        DONE_STATUS_ID,
    )
    expect(taskToDraft(task, '2026-10-16', completions).statusId).toBe(
        TODO_STATUS_ID,
    )
    expect(taskToDraft(task, '2026-10-17', completions).statusId).toBe(
        'in-progress',
    )
})

describe('moving the start date', () => {
    const draft = { ...createEmptyDraft('2026-10-20'), endDate: '2026-10-21' }
    it.each(['2026-10-22', '2026-11-01', '2027-01-01'])(
        'moves an expired end date to %s in the same patch',
        (startDate) => {
            expect(normalizeTaskDraftPatch(draft, { startDate })).toEqual({
                startDate,
                endDate: startDate,
            })
        },
    )
    it.each(['2026-10-19', '2026-10-21'])(
        'preserves a valid existing end when start is %s',
        (startDate) => {
            expect(normalizeTaskDraftPatch(draft, { startDate })).toEqual({
                startDate,
            })
        },
    )
    it('preserves an unset end and clearing the start date', () => {
        expect(
            normalizeTaskDraftPatch(
                { ...draft, endDate: null },
                { startDate: '2026-11-01' },
            ),
        ).toEqual({ startDate: '2026-11-01' })
        expect(normalizeTaskDraftPatch(draft, { startDate: null })).toEqual({
            startDate: null,
        })
    })
    it('uses the explicitly supplied end and leaves unrelated fields intact', () => {
        const patch = {
            startDate: '2026-11-01',
            endDate: '2026-11-03',
            title: 'Trip',
        }
        expect(normalizeTaskDraftPatch(draft, patch)).toEqual(patch)
        expect(normalizeTaskDraftPatch(draft, { title: 'Trip' })).toEqual({
            title: 'Trip',
        })
    })
})
