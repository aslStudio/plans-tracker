import AsyncStorage from '@react-native-async-storage/async-storage'

import { habitsRepository } from './habits-repository'

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('habitsRepository', () => {
    it('creates a habit with an uncategorized default', async () => {
        const habit = await habitsRepository.create({
            title: 'Drink water',
            repeat: { type: 'daily' },
        })

        expect(habit.title).toBe('Drink water')
        expect(habit.categoryId).toBeNull()
        expect(habit.repeat).toEqual({ type: 'daily' })
    })

    it('creates a habit on a weekly repeat rule with specific weekdays', async () => {
        const habit = await habitsRepository.create({
            title: 'Gym',
            repeat: { type: 'weekly', daysOfWeek: [1, 3, 5] },
        })

        expect(habit.repeat).toEqual({ type: 'weekly', daysOfWeek: [1, 3, 5] })
    })

    it('starts with no categories until the user creates one', async () => {
        expect(await habitsRepository.listCategories()).toEqual([])
    })

    it('creates a category and assigns it to a habit', async () => {
        const category = await habitsRepository.createCategory({
            label: 'Health',
        })
        const habit = await habitsRepository.create({
            title: 'Run',
            categoryId: category.id,
            repeat: { type: 'daily' },
        })

        expect(habit.categoryId).toBe(category.id)
    })

    it('clears categoryId on habits when their category is removed', async () => {
        const category = await habitsRepository.createCategory({
            label: 'Health',
        })
        const habit = await habitsRepository.create({
            title: 'Run',
            categoryId: category.id,
            repeat: { type: 'daily' },
        })

        await habitsRepository.removeCategory(category.id)

        expect((await habitsRepository.get(habit.id))?.categoryId).toBeNull()
    })

    it('removes a habit along with its completions', async () => {
        const habit = await habitsRepository.create({
            title: 'Run',
            repeat: { type: 'daily' },
        })
        await habitsRepository.setCompletion(habit.id, '2026-01-01', true)

        await habitsRepository.remove(habit.id)

        expect(await habitsRepository.get(habit.id)).toBeNull()
        expect(await habitsRepository.listCompletions(habit.id)).toEqual([])
    })

    it('toggles a completion on and off for a given occurrence date', async () => {
        const habit = await habitsRepository.create({
            title: 'Run',
            repeat: { type: 'daily' },
        })

        const marked = await habitsRepository.toggleCompletion(
            habit.id,
            '2026-01-01',
        )
        expect(marked?.occurrenceDate).toBe('2026-01-01')

        const unmarked = await habitsRepository.toggleCompletion(
            habit.id,
            '2026-01-01',
        )
        expect(unmarked).toBeNull()
    })

    it('re-marking the same occurrence date updates completedAt instead of duplicating', async () => {
        const habit = await habitsRepository.create({
            title: 'Run',
            repeat: { type: 'daily' },
        })

        await habitsRepository.setCompletion(habit.id, '2026-01-01', true)
        await habitsRepository.setCompletion(habit.id, '2026-01-01', true)

        expect(await habitsRepository.listCompletions(habit.id)).toHaveLength(1)
    })
})

it('persists the note separately from formatted description', async () => {
    const entity = await habitsRepository.create({
        title: 'Example',
        note: 'https://example.com',
        description: '<p><strong>Description</strong></p>',
        repeat: { type: 'daily' },
    })
    expect(await habitsRepository.get(entity.id)).toEqual(
        expect.objectContaining({
            note: 'https://example.com',
            description: '<p><strong>Description</strong></p>',
        }),
    )
    await habitsRepository.update(entity.id, { note: '' })
    expect(await habitsRepository.get(entity.id)).toEqual(
        expect.objectContaining({
            note: '',
            description: '<p><strong>Description</strong></p>',
        }),
    )
})
