import type { Meta, StoryObj } from '@storybook/react-native'

import type { Habit, HabitCompletion } from '@/shared/api'

import { HabitStreakCard } from './HabitStreakCard'

const habits: Habit[] = [
    {
        id: 'h1',
        title: 'Тренировка',
        repeat: { type: 'daily' },
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
    },
]

const completionsByHabitId: Record<string, HabitCompletion[]> = {
    h1: [
        {
            id: 'c1',
            habitId: 'h1',
            occurrenceDate: '2026-10-12',
            completedAt: '2026-10-12T08:00:00.000Z',
        },
        {
            id: 'c2',
            habitId: 'h1',
            occurrenceDate: '2026-10-13',
            completedAt: '2026-10-13T08:00:00.000Z',
        },
    ],
}

const meta = {
    title: 'HabitsScreen/HabitStreakCard',
    component: HabitStreakCard,
    args: {
        habits,
        completionsByHabitId,
        today: '2026-10-14',
        selectedDate: '2026-10-14',
        onPress: () => {},
        onSelectDate: () => {},
    },
    argTypes: {
        habits: { control: false },
        completionsByHabitId: { control: false },
        onPress: { control: false },
        onSelectDate: { control: false },
    },
} satisfies Meta<typeof HabitStreakCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
