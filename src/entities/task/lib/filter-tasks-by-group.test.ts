import { TODO_STATUS_ID } from '@/shared/api'
import type { Task } from '@/shared/api'

import { filterTasksByGroup } from './filter-tasks-by-group'

function makeTask(overrides: Partial<Task>): Task {
    return {
        id: 'task-1',
        title: 'Task',
        statusId: TODO_STATUS_ID,
        priorityId: null,
        groupId: null,
        startDate: null,
        endDate: null,
        repeat: null,
        createdAt: '2026-10-12T00:00:00.000Z',
        updatedAt: '2026-10-12T00:00:00.000Z',
        ...overrides,
    }
}

describe('filterTasksByGroup', () => {
    const work = makeTask({ id: 'work', groupId: 'group-work' })
    const home = makeTask({ id: 'home', groupId: 'group-home' })
    const ungrouped = makeTask({ id: 'ungrouped', groupId: null })
    const all = [work, home, ungrouped]

    it('returns every task for "all"', () => {
        expect(filterTasksByGroup(all, 'all')).toEqual(all)
    })

    it('returns only tasks with no group for "ungrouped"', () => {
        expect(filterTasksByGroup(all, 'ungrouped').map((t) => t.id)).toEqual([
            'ungrouped',
        ])
    })

    it('returns only tasks matching a specific group id', () => {
        expect(filterTasksByGroup(all, 'group-work').map((t) => t.id)).toEqual([
            'work',
        ])
    })
})
