import { rescheduleTaskDates } from './reschedule-task'
import type { Task } from '@/shared/api'
const task: Task = {
    id: 'a',
    title: 'Работа',
    statusId: 'status-todo',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    startMinute: 600,
    durationMinutes: 45,
    createdAt: '',
    updatedAt: '',
}
it('moves a single-day task without touching its time or other fields', () => {
    expect(rescheduleTaskDates(task, '2026-10-16', '2026-10-15')).toEqual({
        startDate: '2026-10-16',
        endDate: '2026-10-16',
    })
})
it('shifts the full range from the grabbed day and assigns undated tasks', () => {
    expect(
        rescheduleTaskDates(
            { ...task, endDate: '2026-10-18' },
            '2026-10-19',
            '2026-10-16',
        ),
    ).toEqual({ startDate: '2026-10-18', endDate: '2026-10-21' })
    expect(
        rescheduleTaskDates(
            { ...task, startDate: null, endDate: null },
            '2026-10-16',
        ),
    ).toEqual({ startDate: '2026-10-16', endDate: '2026-10-16' })
})
it('shifts weekly repeat days across a week boundary', () => {
    expect(
        rescheduleTaskDates(
            { ...task, repeat: { type: 'weekly', daysOfWeek: [0, 4] } },
            '2026-10-14',
            '2026-10-15',
        ).repeat,
    ).toEqual({ type: 'weekly', daysOfWeek: [6, 3] })
})
