import {
    defaultTaskStatuses,
    DONE_STATUS_ID,
    TODO_STATUS_ID,
    type Task,
} from '@/shared/api'
import { buildTaskWidgetPayload } from './build-task-widget-payload'

const today = '2026-10-14'
const task = (id: string, patch: Partial<Task> = {}): Task => ({
    id,
    title: id,
    statusId: TODO_STATUS_ID,
    startDate: today,
    endDate: today,
    createdAt: '',
    updatedAt: '',
    ...patch,
})

it('includes today ranges and recurring occurrences, excluding backlog and other dates', () => {
    const days = buildTaskWidgetPayload(
        [
            task('today'),
            task('range', { startDate: '2026-10-12', endDate: '2026-10-16' }),
            task('backlog', { startDate: null, endDate: null }),
            task('tomorrow', {
                startDate: '2026-10-15',
                endDate: '2026-10-15',
            }),
            task('daily', {
                startDate: '2026-10-01',
                endDate: '2026-10-01',
                repeat: { type: 'daily' },
            }),
            task('sunday', { repeat: { type: 'weekly', daysOfWeek: [0] } }),
        ],
        defaultTaskStatuses,
        [],
        today,
    )
    expect(days).toHaveLength(7)
    expect(days[0].items.map((item) => item.id)).toEqual([
        'today',
        'range',
        'daily',
    ])
    expect(days[1].date).toBe('2026-10-15')
    expect(days[1].items.map((item) => item.id)).toEqual([
        'range',
        'tomorrow',
        'daily',
    ])
})

it('uses custom completed statuses and date-specific recurring completions', () => {
    const days = buildTaskWidgetPayload(
        [
            task('custom', { statusId: 'custom-done' }),
            task('daily', {
                statusId: DONE_STATUS_ID,
                repeat: { type: 'daily' },
            }),
        ],
        [
            ...defaultTaskStatuses,
            {
                id: 'custom-done',
                label: 'Done',
                order: 3,
                isCompleted: true,
                isBuiltIn: false,
            },
        ],
        [{ id: 'c', taskId: 'daily', occurrenceDate: today, completedAt: '' }],
        today,
    )
    expect(days[0].items.map((item) => item.completed)).toEqual([true, true])
    expect(days[1].items).toEqual([
        { id: 'daily', title: 'daily', completed: false, recurring: true },
    ])
})
