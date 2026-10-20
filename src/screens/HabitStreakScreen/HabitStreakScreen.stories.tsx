import type { Meta, StoryObj } from '@storybook/react-native'

import type { Habit, HabitCompletion } from '@/shared/api'

import { HabitStreakScreen } from './HabitStreakScreen'

const habit: Habit = {
    id: 'water',
    title: 'Пить воду',
    repeat: { type: 'daily' },
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
}

const completions: HabitCompletion[] = ['2026-10-12', '2026-10-13'].map(
    (occurrenceDate, index) => ({
        id: `completion-${index}`,
        habitId: habit.id,
        occurrenceDate,
        completedAt: '2026-10-13T10:00:00.000Z',
    }),
)

const meta = {
    title: 'HabitStreakScreen',
    component: HabitStreakScreen,
    args: {
        habits: [habit],
        completionsByHabitId: { [habit.id]: completions },
        today: '2026-10-14',
        onClose: () => {},
        onToggleCompletion: () => {},
    },
    argTypes: {
        habits: { control: false },
        completionsByHabitId: { control: false },
        onClose: { control: false },
        onToggleCompletion: { control: false },
    },
} satisfies Meta<typeof HabitStreakScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
