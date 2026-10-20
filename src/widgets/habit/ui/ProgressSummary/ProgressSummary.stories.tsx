import type { Meta, StoryObj } from '@storybook/react-native'

import type { Habit } from '@/shared/api'

import { ProgressSummary } from './ProgressSummary'

const habits: Habit[] = [
    {
        id: 'h1',
        title: 'Тренировка',
        repeat: { type: 'daily' },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
]

const meta = {
    title: 'HabitsScreen/ProgressSummary',
    component: ProgressSummary,
    args: {
        habits,
        completionsByHabitId: {},
        today: '2026-10-14',
    },
    argTypes: {
        habits: { control: false },
        completionsByHabitId: { control: false },
    },
} satisfies Meta<typeof ProgressSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Completed: Story = {
    name: 'Выполнено',
    args: {
        completionsByHabitId: {
            h1: [
                {
                    id: 'c1',
                    habitId: 'h1',
                    occurrenceDate: '2026-10-14',
                    completedAt: '2026-10-14T08:00:00.000Z',
                },
            ],
        },
    },
}

export const NoHabits: Story = {
    name: 'Нет привычек',
    args: { habits: [] },
}
