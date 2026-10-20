import { TODO_STATUS_ID } from '@/shared/api'
import type { Task, TaskGroup } from '@/shared/api'

import { resolveGroupLabel } from './resolve-group-label'

const group: TaskGroup = {
    id: 'group-work',
    label: 'Работа',
    color: 'accent-blue',
    order: 0,
}

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

describe('resolveGroupLabel', () => {
    it('returns null when groups are disabled, regardless of the task', () => {
        expect(
            resolveGroupLabel(
                makeTask({ groupId: 'group-work' }),
                [group],
                false,
            ),
        ).toBeNull()
    })

    it("resolves the task's own group and color when groups are enabled", () => {
        expect(
            resolveGroupLabel(
                makeTask({ groupId: 'group-work' }),
                [group],
                true,
            ),
        ).toEqual({
            text: 'Работа',
            color: 'accent-blue',
        })
    })

    it('falls back to the gray "Другие" label for an ungrouped task', () => {
        expect(
            resolveGroupLabel(makeTask({ groupId: null }), [group], true),
        ).toEqual({
            text: 'Другие',
            color: 'gray-gray',
        })
    })

    it('falls back to "Другие" when the task points at a group that no longer exists', () => {
        expect(
            resolveGroupLabel(
                makeTask({ groupId: 'deleted-group' }),
                [group],
                true,
            ),
        ).toEqual({
            text: 'Другие',
            color: 'gray-gray',
        })
    })
})
