import type { Meta, StoryObj } from '@storybook/react-native'
import { fn } from 'storybook/test'

import { HabitsScreen } from './HabitsScreen'

const now = new Date().toISOString()

const meta = {
    title: 'Screens/HabitsScreen',
    component: HabitsScreen,
    parameters: { noSafeArea: true },
    args: {
        categories: [
            {
                id: 'health',
                label: 'Здоровье',
                order: 0,
                color: 'accent-green',
            },
        ],
        useCategories: true,
        isLoading: false,
        onAddHabit: fn(),
        onOpenHabit: fn(),
        onDeleteHabit: fn(),
        onToggleCompletion: fn(),
        onOpenSettings: fn(),
        onOpenStreak: fn(),
        habits: [
            {
                id: '1',
                title: 'Пить воду',
                categoryId: 'health',
                repeat: { type: 'daily' },
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '2',
                title: 'Тренировка',
                categoryId: 'health',
                repeat: { type: 'weekly', daysOfWeek: [1, 3, 5] },
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '3',
                title: 'Читать 10 страниц',
                categoryId: null,
                repeat: { type: 'daily' },
                createdAt: now,
                updatedAt: now,
            },
        ],
        completionsByHabitId: {
            '1': [
                {
                    id: 'c1',
                    habitId: '1',
                    occurrenceDate: now.slice(0, 10),
                    completedAt: now,
                },
            ],
        },
    },
} satisfies Meta<typeof HabitsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
export const Empty: Story = {
    name: 'Пусто',
    args: { habits: [], completionsByHabitId: {} },
}
export const Loading: Story = {
    name: 'Загрузка',
    args: { habits: [], isLoading: true },
}
