import { createAgendaCells, DEFAULT_DAY_PREFERENCES } from './agenda-cells'
import { TODO_STATUS_ID, defaultTaskStatuses } from '@/shared/api'
import { DEFAULT_TASK_SORT } from '@/entities/task'

const task = (id: string, groupId: string | null) => ({
    id,
    title: id,
    groupId,
    statusId: TODO_STATUS_ID,
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
})
it('keeps task cells stable as new days are appended and filters only the selected day', () => {
    const cellsForDay = createAgendaCells(defaultTaskStatuses, [])
    const day = {
        date: '2026-10-15',
        tasks: [task('a', 'work'), task('b', null)],
    }
    const original = cellsForDay(day, DEFAULT_DAY_PREFERENCES)
    cellsForDay({ date: '2026-10-16', tasks: [] }, DEFAULT_DAY_PREFERENCES)
    expect(cellsForDay(day, DEFAULT_DAY_PREFERENCES)).toBe(original)
    const filtered = cellsForDay(day, {
        sort: DEFAULT_TASK_SORT,
        group: 'work',
    })
    expect(filtered.filter((cell) => cell.type === 'task')).toEqual([
        expect.objectContaining({
            task: day.tasks[0],
            first: true,
            last: true,
        }),
    ])
    const empty = cellsForDay(day, {
        sort: DEFAULT_TASK_SORT,
        group: 'missing',
    })
    expect(empty[1]).toMatchObject({ type: 'empty', filtered: true })
})
