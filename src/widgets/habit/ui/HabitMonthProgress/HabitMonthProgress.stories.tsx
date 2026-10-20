import type { Meta, StoryObj } from '@storybook/react-native'

import type { Habit, HabitCompletion } from '@/shared/api'

import { HabitMonthProgress } from './HabitMonthProgress'

const habit: Habit = {
    id: 'h1',
    title: 'Тренировка',
    repeat: { type: 'daily' },
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
}

const completions: HabitCompletion[] = [
    {
        id: 'c1',
        habitId: 'h1',
        occurrenceDate: '2026-10-10',
        completedAt: '2026-10-10T08:00:00.000Z',
    },
    {
        id: 'c2',
        habitId: 'h1',
        occurrenceDate: '2026-10-11',
        completedAt: '2026-10-11T08:00:00.000Z',
    },
    {
        id: 'c3',
        habitId: 'h1',
        occurrenceDate: '2026-10-13',
        completedAt: '2026-10-13T08:00:00.000Z',
    },
]

const meta = {
    title: 'HabitDetailScreen/HabitMonthProgress',
    component: HabitMonthProgress,
    args: {
        habit,
        completions,
        today: '2026-10-14',
    },
    argTypes: {
        habit: { control: false },
        completions: { control: false },
    },
} satisfies Meta<typeof HabitMonthProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
