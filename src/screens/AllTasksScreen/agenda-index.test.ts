import { createAgendaIndex } from './agenda-index'
import { TODO_STATUS_ID } from '@/shared/api'

it('reuses earlier day and occurrence identities when later pages are requested', () => {
    const task = {
        id: 'daily',
        title: 'Daily',
        statusId: TODO_STATUS_ID,
        repeat: { type: 'daily' as const },
        startDate: '2026-10-01',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
    }
    const dayAt = createAgendaIndex([task])
    const first = dayAt('2026-10-15')
    dayAt('2026-10-16')
    expect(dayAt('2026-10-15')).toBe(first)
    expect(dayAt('2026-10-15').tasks[0]).toBe(first.tasks[0])
    const updated = createAgendaIndex([{ ...task, title: 'Changed' }])
    expect(updated('2026-10-15').tasks[0].title).toBe('Changed')
})
