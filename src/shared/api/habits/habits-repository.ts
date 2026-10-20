import type { Color } from '@/shared/config/color'

import { generateId } from '../common/id'
import { createLocalCollectionStore } from '../common/local-collection-store'
import { nowIso } from '../common/time'
import type { EntityId } from '../common/types'
import {
    type CreateHabitInput,
    type Habit,
    type HabitCategory,
    type HabitCompletion,
    type UpdateHabitInput,
} from './model'

const habitsStore = createLocalCollectionStore<Habit>('plans-tracker.habits')
const categoriesStore = createLocalCollectionStore<HabitCategory>(
    'plans-tracker.habit-categories',
)
const completionsStore = createLocalCollectionStore<HabitCompletion>(
    'plans-tracker.habit-completions',
)

export const habitsRepository = {
    list(): Promise<Habit[]> {
        return habitsStore.list()
    },

    get(id: EntityId): Promise<Habit | null> {
        return habitsStore.get(id)
    },

    create(input: CreateHabitInput): Promise<Habit> {
        const timestamp = nowIso()
        const habit: Habit = {
            id: generateId(),
            title: input.title,
            note: input.note ?? '',
            categoryId: input.categoryId ?? null,
            description: input.description ?? '',
            repeat: input.repeat,
            startMinute: input.startMinute ?? null,
            durationMinutes: input.durationMinutes ?? 60,
            createdAt: timestamp,
            updatedAt: timestamp,
        }
        return habitsStore.insert(habit)
    },

    update(id: EntityId, patch: UpdateHabitInput): Promise<Habit> {
        return habitsStore.update(id, { ...patch, updatedAt: nowIso() })
    },

    async remove(id: EntityId): Promise<void> {
        await habitsStore.remove(id)
        const completions = await completionsStore.list()
        await Promise.all(
            completions
                .filter((c) => c.habitId === id)
                .map((c) => completionsStore.remove(c.id)),
        )
    },

    listCategories(): Promise<HabitCategory[]> {
        return categoriesStore.list()
    },

    async createCategory(input: {
        label: string
        color?: Color
    }): Promise<HabitCategory> {
        const existing = await categoriesStore.list()
        const category: HabitCategory = {
            id: generateId(),
            label: input.label,
            color: input.color,
            order: existing.length,
        }
        return categoriesStore.insert(category)
    },

    updateCategory(
        id: EntityId,
        patch: Partial<Pick<HabitCategory, 'label' | 'color' | 'order'>>,
    ): Promise<HabitCategory> {
        return categoriesStore.update(id, patch)
    },

    async removeCategory(id: EntityId): Promise<void> {
        await categoriesStore.remove(id)
        const affected = (await habitsStore.list()).filter(
            (habit) => habit.categoryId === id,
        )
        await Promise.all(
            affected.map((habit) =>
                habitsStore.update(habit.id, {
                    categoryId: null,
                    updatedAt: nowIso(),
                }),
            ),
        )
    },

    async listCompletions(habitId: EntityId): Promise<HabitCompletion[]> {
        const all = await completionsStore.list()
        return all.filter((c) => c.habitId === habitId)
    },

    listAllCompletions(): Promise<HabitCompletion[]> {
        return completionsStore.list()
    },

    async setCompletion(
        habitId: EntityId,
        occurrenceDate: string,
        completed: boolean,
    ): Promise<HabitCompletion | null> {
        if (!completed) {
            const all = await completionsStore.list()
            const existing = all.find(
                (c) =>
                    c.habitId === habitId &&
                    c.occurrenceDate === occurrenceDate,
            )
            if (existing) await completionsStore.remove(existing.id)
            return null
        }
        return completionsStore.upsert(
            (c) => c.habitId === habitId && c.occurrenceDate === occurrenceDate,
            () => ({
                id: generateId(),
                habitId,
                occurrenceDate,
                completedAt: nowIso(),
            }),
            (existing) => ({ ...existing, completedAt: nowIso() }),
        )
    },

    async toggleCompletion(
        habitId: EntityId,
        occurrenceDate: string,
    ): Promise<HabitCompletion | null> {
        const all = await completionsStore.list()
        const existing = all.find(
            (c) => c.habitId === habitId && c.occurrenceDate === occurrenceDate,
        )
        return habitsRepository.setCompletion(
            habitId,
            occurrenceDate,
            !existing,
        )
    },
}

export type HabitsRepository = typeof habitsRepository
