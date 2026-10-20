import { TODO_STATUS_ID } from '@/shared/api'
import type { Task, TaskPriority } from '@/shared/api'

import { resolvePriorityLabel } from './resolve-priority-label'

const priority: TaskPriority = {
    id: 'priority-high',
    label: 'Высокий',
    color: 'accent-red',
    order: 2,
    isBuiltIn: true,
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

describe('resolvePriorityLabel', () => {
    it('returns null when priority is disabled app-wide, regardless of the task', () => {
        expect(
            resolvePriorityLabel(
                makeTask({ priorityId: 'priority-high' }),
                [priority],
                false,
            ),
        ).toBeNull()
    })

    it('returns null for a task with no priority set — no "Другие"-style fallback', () => {
        expect(
            resolvePriorityLabel(
                makeTask({ priorityId: null }),
                [priority],
                true,
            ),
        ).toBeNull()
    })

    it("resolves the task's own priority and color when enabled", () => {
        expect(
            resolvePriorityLabel(
                makeTask({ priorityId: 'priority-high' }),
                [priority],
                true,
            ),
        ).toEqual({
            text: 'Высокий',
            color: 'accent-red',
        })
    })

    it('falls back to a neutral color for a priority with none of its own', () => {
        const uncolored: TaskPriority = {
            id: 'priority-low',
            label: 'Низкий',
            order: 0,
            isBuiltIn: true,
        }
        expect(
            resolvePriorityLabel(
                makeTask({ priorityId: 'priority-low' }),
                [uncolored],
                true,
            ),
        ).toEqual({
            text: 'Низкий',
            color: 'labels-tertiary',
        })
    })

    it('returns null when the task points at a priority that no longer exists', () => {
        expect(
            resolvePriorityLabel(
                makeTask({ priorityId: 'deleted' }),
                [priority],
                true,
            ),
        ).toBeNull()
    })
})
