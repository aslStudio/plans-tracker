import type { Meta, StoryObj } from '@storybook/react-native'

import type { Habit } from '@/shared/api'
import type { WeekStripDay } from '@/entities/habit'

import { HabitRow } from './HabitRow'

const habit: Habit = {
    id: 'h1',
    title: 'Тренировка',
    repeat: { type: 'daily' },
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
}

const weekStrip: WeekStripDay[] = [
    { date: '2026-10-08', state: 'done' },
    { date: '2026-10-09', state: 'missed' },
    { date: '2026-10-10', state: 'done' },
    { date: '2026-10-11', state: 'not-due' },
    { date: '2026-10-12', state: 'done' },
    { date: '2026-10-13', state: 'future' },
    { date: '2026-10-14', state: 'future' },
]

const meta = {
    title: 'HabitsScreen/HabitRow',
    component: HabitRow,
    args: {
        habit,
        category: {
            id: 'sport',
            label: 'Спорт',
            color: 'accent-orange',
            order: 0,
        },
        isCompleted: false,
        isDue: true,
        completionActionLabel: 'Отметить выполненной',
        weekStrip,
        onToggle: () => {},
        onPress: () => {},
    },
    argTypes: {
        habit: { control: false },
        category: { control: false },
        weekStrip: { control: false },
        onToggle: { control: false },
        onPress: { control: false },
    },
} satisfies Meta<typeof HabitRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Completed: Story = {
    name: 'Выполнено',
    args: { isCompleted: true },
}

export const NotDue: Story = {
    name: 'Не по плану',
    args: { isDue: false },
}
