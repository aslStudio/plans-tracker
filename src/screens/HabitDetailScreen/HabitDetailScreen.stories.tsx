import type { Meta, StoryObj } from '@storybook/react-native'
import { fn } from 'storybook/test'

import { todayDateString } from '@/shared/lib/date'

import { createEmptyDraft, habitToDraft } from '@/features/edit-habit'
import { HabitDetailScreen } from './HabitDetailScreen'

const now = new Date().toISOString()
const today = todayDateString()

const habit = {
    id: '1',
    title: 'Пить воду',
    categoryId: 'health',
    repeat: { type: 'weekly' as const, daysOfWeek: [1, 3, 5] as [1, 3, 5] },
    createdAt: now,
    updatedAt: now,
}

const meta = {
    title: 'Screens/HabitDetailScreen',
    component: HabitDetailScreen,
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
        completions: [],
        today,
        onChange: fn(),
        onSetCompletion: fn(),
        onCreateCategory: fn(async () => ({
            id: 'new',
            label: 'Новая',
            order: 1,
        })),
        onClose: fn(),
        onSave: fn(),
    },
} satisfies Meta<typeof HabitDetailScreen>

export default meta
type Story = StoryObj<typeof meta>

export const New: Story = {
    name: 'Новая привычка',
    args: { draft: createEmptyDraft(), habit: null, isNew: true },
}

export const Editing: Story = {
    name: 'Редактирование',
    args: {
        draft: habitToDraft(habit),
        habit,
        isNew: false,
        onDelete: fn(),
        completions: [
            { id: 'c1', habitId: '1', occurrenceDate: today, completedAt: now },
        ],
    },
}
