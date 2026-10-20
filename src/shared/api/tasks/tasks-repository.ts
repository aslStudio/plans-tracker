import { orderTaskStatuses } from './status-order'
import type { AccentColor, Color } from '@/shared/config/color'

import { generateId } from '../common/id'
import { createLocalCollectionStore } from '../common/local-collection-store'
import { nowIso } from '../common/time'
import type { EntityId } from '../common/types'
import {
    type CreateTaskInput,
    defaultTaskPriorities,
    defaultTaskStatuses,
    type Task,
    type TaskCompletion,
    type TaskGroup,
    type TaskPriority,
    type TaskStatus,
    TODO_STATUS_ID,
    DONE_STATUS_ID,
    type UpdateTaskGroupInput,
    type UpdateTaskInput,
} from './model'

let statusChangeQueue: Promise<unknown> = Promise.resolve()
function enqueueStatusChange(action: () => Promise<void>): Promise<void> {
    const next = statusChangeQueue.then(action)
    statusChangeQueue = next.catch(() => {})
    return next
}

const tasksStore = createLocalCollectionStore<Task>('plans-tracker.tasks')
const statusesStore = createLocalCollectionStore<TaskStatus>(
    'plans-tracker.task-statuses',
)
const prioritiesStore = createLocalCollectionStore<TaskPriority>(
    'plans-tracker.task-priorities',
)
const groupsStore = createLocalCollectionStore<TaskGroup>(
    'plans-tracker.task-groups',
)
const completionsStore = createLocalCollectionStore<TaskCompletion>(
    'plans-tracker.task-completions',
)

async function ensureSeeded(): Promise<void> {
    await statusesStore.seedIfEmpty(defaultTaskStatuses)
    await prioritiesStore.seedIfEmpty(defaultTaskPriorities)
}

export const tasksRepository = {
    subscribe(listener: () => void): () => void {
        const unsubscribe = [tasksStore, statusesStore, completionsStore].map(
            (store) => store.subscribe(listener),
        )
        return () => unsubscribe.forEach((stop) => stop())
    },

    async list(): Promise<Task[]> {
        return tasksStore.list()
    },

    get(id: EntityId): Promise<Task | null> {
        return tasksStore.get(id)
    },

    async create(input: CreateTaskInput): Promise<Task> {
        await ensureSeeded()
        const timestamp = nowIso()
        // Giving just one of start/end makes a plain one-day task — mirror it
        // onto the other rather than leaving a half-set range.
        const startDate = input.startDate ?? input.endDate ?? null
        const endDate = input.endDate ?? input.startDate ?? null
        const task: Task = {
            id: generateId(),
            title: input.title,
            note: input.note ?? '',
            description: input.description,
            statusId: input.statusId ?? TODO_STATUS_ID,
            priorityId: input.priorityId ?? null,
            groupId: input.groupId ?? null,
            startMinute: input.startMinute ?? null,
            durationMinutes: input.durationMinutes ?? 60,
            startDate,
            endDate,
            repeat: input.repeat ?? null,
            createdAt: timestamp,
            updatedAt: timestamp,
        }
        return tasksStore.insert(task)
    },

    update(id: EntityId, patch: UpdateTaskInput): Promise<Task> {
        return tasksStore.update(id, { ...patch, updatedAt: nowIso() })
    },

    /** Editor status belongs to the opened occurrence, not the entire series. */
    async updateOccurrence(
        id: EntityId,
        occurrenceDate: string,
        patch: UpdateTaskInput,
    ): Promise<void> {
        return enqueueStatusChange(async () => {
            const task = await tasksStore.get(id)
            if (!task) throw new Error('Task not found')
            const repeat =
                patch.repeat === undefined ? task.repeat : patch.repeat
            if (!repeat) {
                await tasksRepository.update(id, patch)
                return
            }
            const { statusId, ...fields } = patch
            await tasksRepository.update(id, {
                ...fields,
                ...(statusId === undefined
                    ? {}
                    : {
                          occurrenceStatusIds: {
                              ...task.occurrenceStatusIds,
                              [occurrenceDate]: statusId,
                          },
                      }),
            })
            if (statusId !== undefined) {
                const completed = (
                    await tasksRepository.listCompletions(id)
                ).some((c) => c.occurrenceDate === occurrenceDate)
                if (completed !== (statusId === DONE_STATUS_ID))
                    await tasksRepository.setCompletion(
                        id,
                        occurrenceDate,
                        statusId === DONE_STATUS_ID,
                    )
            }
        })
    },

    async remove(id: EntityId): Promise<void> {
        await tasksStore.remove(id)
        const completions = await completionsStore.list()
        await Promise.all(
            completions
                .filter((c) => c.taskId === id)
                .map((c) => completionsStore.remove(c.id)),
        )
    },

    async advanceStatus(id: EntityId, occurrenceDate?: string): Promise<void> {
        return enqueueStatusChange(async () => {
            const task = await tasksStore.get(id)
            if (!task) throw new Error('Task not found')
            const statuses = await tasksRepository.listStatuses()
            const recurring = !!task.repeat && !!occurrenceDate
            const completed =
                recurring &&
                (await completionsStore.list()).some(
                    (item) =>
                        item.taskId === id &&
                        item.occurrenceDate === occurrenceDate,
                )
            const current = recurring
                ? completed
                    ? DONE_STATUS_ID
                    : (task.occurrenceStatusIds?.[occurrenceDate!] ??
                      TODO_STATUS_ID)
                : task.statusId
            const index = statuses.findIndex((status) => status.id === current)
            const next = statuses[(index + 1) % statuses.length].id
            if (recurring) {
                await tasksRepository.update(id, {
                    occurrenceStatusIds: {
                        ...task.occurrenceStatusIds,
                        [occurrenceDate!]: next,
                    },
                })
                await tasksRepository.setCompletion(
                    id,
                    occurrenceDate!,
                    next === DONE_STATUS_ID,
                )
            } else await tasksRepository.update(id, { statusId: next })
        })
    },

    async listStatuses(): Promise<TaskStatus[]> {
        await ensureSeeded()
        return orderTaskStatuses(await statusesStore.list())
    },

    async createStatus(input: {
        label: string
        color?: Color
        isCompleted?: boolean
    }): Promise<TaskStatus> {
        await ensureSeeded()
        const existing = await tasksRepository.listStatuses()
        const status: TaskStatus = {
            id: generateId(),
            label: input.label,
            color: input.color,
            order: existing.length - 1,
            isCompleted: false,
            isBuiltIn: false,
        }
        const ordered = await statusesStore.transform((items) =>
            orderTaskStatuses([...items, status]),
        )
        return ordered.find((item) => item.id === status.id)!
    },

    async updateStatus(
        id: EntityId,
        patch: Partial<
            Pick<TaskStatus, 'label' | 'color' | 'order' | 'isCompleted'>
        >,
    ): Promise<TaskStatus> {
        await ensureSeeded()
        const result = await statusesStore.transform((items) =>
            orderTaskStatuses(
                items.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              label: patch.label ?? item.label,
                              color:
                                  'color' in patch ? patch.color : item.color,
                          }
                        : item,
                ),
            ),
        )
        const updated = result.find((item) => item.id === id)
        if (!updated) throw new Error('Status not found')
        return updated
    },

    async reorderStatuses(ids: EntityId[]): Promise<TaskStatus[]> {
        await ensureSeeded()
        return statusesStore.transform((items) => {
            if (
                ids.length !== items.length ||
                new Set(ids).size !== items.length ||
                ids[0] !== TODO_STATUS_ID ||
                ids.at(-1) !== DONE_STATUS_ID ||
                items.some((item) => !ids.includes(item.id))
            )
                throw new Error('Invalid status order')
            return orderTaskStatuses(
                items.map((item) => ({ ...item, order: ids.indexOf(item.id) })),
            )
        })
    },

    async removeStatus(id: EntityId): Promise<void> {
        await ensureSeeded()
        const status = await statusesStore.get(id)
        if (status?.isBuiltIn)
            throw new Error('Built-in statuses cannot be removed')
        await statusesStore.remove(id)
        // Tasks pointing at the removed status fall back to "todo" rather than dangling.
        const affected = (await tasksStore.list()).filter(
            (task) =>
                task.statusId === id ||
                Object.values(task.occurrenceStatusIds ?? {}).includes(id),
        )
        await Promise.all(
            affected.map((task) =>
                tasksStore.update(task.id, {
                    statusId:
                        task.statusId === id ? TODO_STATUS_ID : task.statusId,
                    occurrenceStatusIds: Object.fromEntries(
                        Object.entries(task.occurrenceStatusIds ?? {}).filter(
                            ([, statusId]) => statusId !== id,
                        ),
                    ),
                    updatedAt: nowIso(),
                }),
            ),
        )
    },

    async listPriorities(): Promise<TaskPriority[]> {
        await ensureSeeded()
        return prioritiesStore.list()
    },

    async createPriority(input: {
        label: string
        color?: Color
    }): Promise<TaskPriority> {
        await ensureSeeded()
        const existing = await prioritiesStore.list()
        const priority: TaskPriority = {
            id: generateId(),
            label: input.label,
            color: input.color,
            order: existing.length,
            isBuiltIn: false,
        }
        return prioritiesStore.insert(priority)
    },

    updatePriority(
        id: EntityId,
        patch: Partial<Pick<TaskPriority, 'label' | 'color' | 'order'>>,
    ): Promise<TaskPriority> {
        return prioritiesStore.update(id, patch)
    },

    async removePriority(id: EntityId): Promise<void> {
        await ensureSeeded()
        const priority = await prioritiesStore.get(id)
        if (priority?.isBuiltIn)
            throw new Error('Built-in priorities cannot be removed')
        await prioritiesStore.remove(id)
        const affected = (await tasksStore.list()).filter(
            (task) => task.priorityId === id,
        )
        await Promise.all(
            affected.map((task) =>
                tasksStore.update(task.id, {
                    priorityId: null,
                    updatedAt: nowIso(),
                }),
            ),
        )
    },

    listGroups(): Promise<TaskGroup[]> {
        return groupsStore.list()
    },

    async createGroup(input: {
        label: string
        color: AccentColor
    }): Promise<TaskGroup> {
        const existing = await groupsStore.list()
        const group: TaskGroup = {
            id: generateId(),
            label: input.label,
            color: input.color,
            order: existing.length,
        }
        return groupsStore.insert(group)
    },

    updateGroup(id: EntityId, patch: UpdateTaskGroupInput): Promise<TaskGroup> {
        return groupsStore.update(id, patch)
    },

    async removeGroup(id: EntityId): Promise<void> {
        await groupsStore.remove(id)
        const affected = (await tasksStore.list()).filter(
            (task) => task.groupId === id,
        )
        await Promise.all(
            affected.map((task) =>
                tasksStore.update(task.id, {
                    groupId: null,
                    updatedAt: nowIso(),
                }),
            ),
        )
    },

    async listCompletions(taskId: EntityId): Promise<TaskCompletion[]> {
        const all = await completionsStore.list()
        return all.filter((c) => c.taskId === taskId)
    },

    listAllCompletions(): Promise<TaskCompletion[]> {
        return completionsStore.list()
    },

    /** Only meaningful for a task with `repeat` set — a one-off task's completion is just its `statusId`. */
    async setCompletion(
        taskId: EntityId,
        occurrenceDate: string,
        completed: boolean,
    ): Promise<TaskCompletion | null> {
        if (!completed) {
            const all = await completionsStore.list()
            const existing = all.find(
                (c) =>
                    c.taskId === taskId && c.occurrenceDate === occurrenceDate,
            )
            if (existing) await completionsStore.remove(existing.id)
            const task = await tasksStore.get(taskId)
            if (task?.occurrenceStatusIds?.[occurrenceDate] === DONE_STATUS_ID)
                await tasksRepository.update(taskId, {
                    occurrenceStatusIds: {
                        ...task.occurrenceStatusIds,
                        [occurrenceDate]: TODO_STATUS_ID,
                    },
                })
            return null
        }
        return completionsStore.upsert(
            (c) => c.taskId === taskId && c.occurrenceDate === occurrenceDate,
            () => ({
                id: generateId(),
                taskId,
                occurrenceDate,
                completedAt: nowIso(),
            }),
            (existing) => ({ ...existing, completedAt: nowIso() }),
        )
    },

    async toggleCompletion(
        taskId: EntityId,
        occurrenceDate: string,
    ): Promise<TaskCompletion | null> {
        const all = await completionsStore.list()
        const existing = all.find(
            (c) => c.taskId === taskId && c.occurrenceDate === occurrenceDate,
        )
        return tasksRepository.setCompletion(taskId, occurrenceDate, !existing)
    },
}

export type TasksRepository = typeof tasksRepository
