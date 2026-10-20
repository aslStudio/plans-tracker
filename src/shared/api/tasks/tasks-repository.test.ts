import AsyncStorage from '@react-native-async-storage/async-storage'

import { DONE_STATUS_ID, TODO_STATUS_ID } from './model'
import { tasksRepository } from './tasks-repository'

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('tasksRepository', () => {
    it('seeds the built-in statuses and priorities on first read', async () => {
        const statuses = await tasksRepository.listStatuses()
        const priorities = await tasksRepository.listPriorities()

        expect(statuses.map((s) => s.id)).toEqual([
            TODO_STATUS_ID,
            DONE_STATUS_ID,
        ])
        expect(statuses.find((s) => s.id === DONE_STATUS_ID)?.isCompleted).toBe(
            true,
        )
        expect(priorities.length).toBe(3)
    })

    it('creates a task defaulting to the "todo" status and no priority', async () => {
        const task = await tasksRepository.create({ title: 'Buy milk' })

        expect(task.title).toBe('Buy milk')
        expect(task.statusId).toBe(TODO_STATUS_ID)
        expect(task.priorityId).toBeNull()
        expect(task.repeat).toBeNull()
        expect(task.createdAt).toBe(task.updatedAt)
    })

    it('creates a recurring task with a custom repeat rule', async () => {
        const task = await tasksRepository.create({
            title: 'Water plants',
            repeat: { type: 'custom', everyNDays: 3 },
        })

        expect(task.repeat).toEqual({ type: 'custom', everyNDays: 3 })
    })

    it('updates a task and bumps updatedAt', async () => {
        const task = await tasksRepository.create({ title: 'Buy milk' })
        await new Promise((resolve) => setTimeout(resolve, 2))

        const updated = await tasksRepository.update(task.id, {
            title: 'Buy oat milk',
        })

        expect(updated.title).toBe('Buy oat milk')
        expect(updated.updatedAt).not.toBe(task.updatedAt)
    })

    it('removes a task along with its completions', async () => {
        const task = await tasksRepository.create({
            title: 'Daily stretch',
            repeat: { type: 'daily' },
        })
        await tasksRepository.setCompletion(task.id, '2026-01-01', true)

        await tasksRepository.remove(task.id)

        expect(await tasksRepository.get(task.id)).toBeNull()
        expect(await tasksRepository.listCompletions(task.id)).toEqual([])
    })

    it('creates a custom status that does not count as completed by default', async () => {
        const status = await tasksRepository.createStatus({
            label: 'In Progress',
        })

        expect(status.isBuiltIn).toBe(false)
        expect(status.isCompleted).toBe(false)
    })

    it('refuses to remove a built-in status', async () => {
        await expect(
            tasksRepository.removeStatus(TODO_STATUS_ID),
        ).rejects.toThrow()
    })

    it('reassigns tasks to "todo" when their custom status is removed', async () => {
        const status = await tasksRepository.createStatus({ label: 'Blocked' })
        const task = await tasksRepository.create({
            title: 'Ship feature',
            statusId: status.id,
        })

        await tasksRepository.removeStatus(status.id)

        expect((await tasksRepository.get(task.id))?.statusId).toBe(
            TODO_STATUS_ID,
        )
    })

    it('refuses to remove a built-in priority', async () => {
        const [low] = await tasksRepository.listPriorities()
        await expect(tasksRepository.removePriority(low.id)).rejects.toThrow()
    })

    it('clears priorityId on tasks when their custom priority is removed', async () => {
        const priority = await tasksRepository.createPriority({
            label: 'Someday',
        })
        const task = await tasksRepository.create({
            title: 'Learn Swift',
            priorityId: priority.id,
        })

        await tasksRepository.removePriority(priority.id)

        expect((await tasksRepository.get(task.id))?.priorityId).toBeNull()
    })

    it('starts with no groups until the user creates one', async () => {
        expect(await tasksRepository.listGroups()).toEqual([])
    })

    it('creates a group with an accent color and assigns it to a task', async () => {
        const group = await tasksRepository.createGroup({
            label: 'Работа',
            color: 'accent-blue',
        })
        const task = await tasksRepository.create({
            title: 'Ship feature',
            groupId: group.id,
        })

        expect(group.color).toBe('accent-blue')
        expect(task.groupId).toBe(group.id)
    })

    it('clears groupId on tasks when their group is removed', async () => {
        const group = await tasksRepository.createGroup({
            label: 'Работа',
            color: 'accent-blue',
        })
        const task = await tasksRepository.create({
            title: 'Ship feature',
            groupId: group.id,
        })

        await tasksRepository.removeGroup(group.id)

        expect((await tasksRepository.get(task.id))?.groupId).toBeNull()
    })

    it('toggles a completion on and off for a given occurrence date', async () => {
        const task = await tasksRepository.create({
            title: 'Daily stretch',
            repeat: { type: 'daily' },
        })

        const marked = await tasksRepository.toggleCompletion(
            task.id,
            '2026-01-01',
        )
        expect(marked).not.toBeNull()
        expect(marked?.occurrenceDate).toBe('2026-01-01')

        const unmarked = await tasksRepository.toggleCompletion(
            task.id,
            '2026-01-01',
        )
        expect(unmarked).toBeNull()
        expect(await tasksRepository.listCompletions(task.id)).toEqual([])
    })

    it('keeps completions for separate occurrence dates independent', async () => {
        const task = await tasksRepository.create({
            title: 'Daily stretch',
            repeat: { type: 'daily' },
        })

        await tasksRepository.setCompletion(task.id, '2026-01-01', true)
        await tasksRepository.setCompletion(task.id, '2026-01-02', true)
        await tasksRepository.setCompletion(task.id, '2026-01-01', false)

        const completions = await tasksRepository.listCompletions(task.id)
        expect(completions.map((c) => c.occurrenceDate)).toEqual(['2026-01-02'])
    })
})

it('persists exact scheduled time and allows removing it without losing the task date', async () => {
    const task = await tasksRepository.create({
        title: 'Focus',
        startDate: '2026-10-13',
        startMinute: 557,
        durationMinutes: 43,
    })
    expect(await tasksRepository.get(task.id)).toMatchObject({
        startMinute: 557,
        durationMinutes: 43,
        startDate: '2026-10-13',
    })
    await tasksRepository.update(task.id, { startMinute: null })
    expect(await tasksRepository.get(task.id)).toMatchObject({
        startMinute: null,
        startDate: '2026-10-13',
    })
})

describe('task widget change subscription', () => {
    it('notifies for task and completion edits, but not unchanged seed reads', async () => {
        await tasksRepository.listStatuses()
        const changed = jest.fn()
        const unsubscribe = tasksRepository.subscribe(changed)
        await tasksRepository.listStatuses()
        expect(changed).not.toHaveBeenCalled()
        const task = await tasksRepository.create({ title: 'Task' })
        expect(changed).toHaveBeenCalledTimes(1)
        await tasksRepository.update(task.id, { title: 'Edited' })
        await tasksRepository.setCompletion(task.id, '2026-10-14', true)
        expect(changed).toHaveBeenCalledTimes(3)
        unsubscribe()
        await tasksRepository.remove(task.id)
        expect(changed).toHaveBeenCalledTimes(3)
    })
})

describe('ordered custom statuses', () => {
    it('inserts custom statuses between the endpoints and persists their reordered sequence', async () => {
        const work = await tasksRepository.createStatus({
            label: 'В работе',
            color: 'accent-blue',
        })
        const test = await tasksRepository.createStatus({
            label: 'Тестирование',
        })
        expect((await tasksRepository.listStatuses()).map((s) => s.id)).toEqual(
            [TODO_STATUS_ID, work.id, test.id, DONE_STATUS_ID],
        )
        await tasksRepository.reorderStatuses([
            TODO_STATUS_ID,
            test.id,
            work.id,
            DONE_STATUS_ID,
        ])
        expect(
            (await tasksRepository.listStatuses()).map((s) => [s.id, s.order]),
        ).toEqual([
            [TODO_STATUS_ID, 0],
            [test.id, 1],
            [work.id, 2],
            [DONE_STATUS_ID, 3],
        ])
        await expect(
            tasksRepository.reorderStatuses([
                work.id,
                TODO_STATUS_ID,
                test.id,
                DONE_STATUS_ID,
            ]),
        ).rejects.toThrow()
        await expect(
            tasksRepository.reorderStatuses([
                TODO_STATUS_ID,
                work.id,
                DONE_STATUS_ID,
                test.id,
            ]),
        ).rejects.toThrow()
        await expect(
            tasksRepository.reorderStatuses([
                TODO_STATUS_ID,
                work.id,
                work.id,
                DONE_STATUS_ID,
            ]),
        ).rejects.toThrow()
    })
    it('cycles a task through custom statuses in the saved order', async () => {
        const work = await tasksRepository.createStatus({ label: 'В работе' })
        const task = await tasksRepository.create({ title: 'Релиз' })
        for (const expected of [work.id, DONE_STATUS_ID, TODO_STATUS_ID]) {
            await tasksRepository.advanceStatus(task.id)
            expect((await tasksRepository.get(task.id))?.statusId).toBe(
                expected,
            )
        }
    })
    it('tracks intermediate recurring statuses per occurrence without marking them completed', async () => {
        const work = await tasksRepository.createStatus({ label: 'В работе' })
        const task = await tasksRepository.create({
            title: 'Проверка',
            repeat: { type: 'daily' },
        })
        const date = '2026-10-15'
        await tasksRepository.advanceStatus(task.id, date)
        expect(
            (await tasksRepository.get(task.id))?.occurrenceStatusIds,
        ).toEqual({ [date]: work.id })
        expect(await tasksRepository.listCompletions(task.id)).toEqual([])
        await tasksRepository.advanceStatus(task.id, date)
        expect(await tasksRepository.listCompletions(task.id)).toHaveLength(1)
        await tasksRepository.advanceStatus(task.id, date)
        expect(await tasksRepository.listCompletions(task.id)).toEqual([])
        expect(
            (await tasksRepository.get(task.id))?.occurrenceStatusIds?.[date],
        ).toBe(TODO_STATUS_ID)
    })
})

it('serializes rapid status taps instead of losing a transition', async () => {
    await tasksRepository.createStatus({ label: 'В работе' })
    const task = await tasksRepository.create({ title: 'Релиз' })
    await Promise.all([
        tasksRepository.advanceStatus(task.id),
        tasksRepository.advanceStatus(task.id),
    ])
    expect((await tasksRepository.get(task.id))?.statusId).toBe(DONE_STATUS_ID)
})

it('edits a completed occurrence without completing tomorrow or changing its completion timestamp', async () => {
    const task = await tasksRepository.create({
        title: 'Daily',
        repeat: { type: 'daily' },
    })
    const completion = await tasksRepository.setCompletion(
        task.id,
        '2026-10-15',
        true,
    )
    await tasksRepository.updateOccurrence(task.id, '2026-10-15', {
        title: 'Updated',
        statusId: DONE_STATUS_ID,
    })
    expect((await tasksRepository.get(task.id))?.statusId).toBe(TODO_STATUS_ID)
    expect(await tasksRepository.listCompletions(task.id)).toEqual([completion])
    await tasksRepository.updateOccurrence(task.id, '2026-10-16', {
        statusId: DONE_STATUS_ID,
    })
    await tasksRepository.updateOccurrence(task.id, '2026-10-15', {
        statusId: TODO_STATUS_ID,
    })
    expect(
        (await tasksRepository.listCompletions(task.id)).map(
            (c) => c.occurrenceDate,
        ),
    ).toEqual(['2026-10-16'])
    expect((await tasksRepository.get(task.id))?.occurrenceStatusIds).toEqual({
        '2026-10-15': TODO_STATUS_ID,
        '2026-10-16': DONE_STATUS_ID,
    })
})

it('persists the note separately from formatted description', async () => {
    const entity = await tasksRepository.create({
        title: 'Example',
        note: 'https://example.com',
        description: '<p><strong>Description</strong></p>',
    })
    expect(await tasksRepository.get(entity.id)).toEqual(
        expect.objectContaining({
            note: 'https://example.com',
            description: '<p><strong>Description</strong></p>',
        }),
    )
    await tasksRepository.update(entity.id, { note: '' })
    expect(await tasksRepository.get(entity.id)).toEqual(
        expect.objectContaining({
            note: '',
            description: '<p><strong>Description</strong></p>',
        }),
    )
})
