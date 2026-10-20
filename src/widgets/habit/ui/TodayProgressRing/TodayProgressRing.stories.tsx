import type { Meta, StoryObj } from '@storybook/react-native'

import { TodayProgressRing } from './TodayProgressRing'

const meta = {
    title: 'HabitsScreen/TodayProgressRing',
    component: TodayProgressRing,
    args: {
        done: 2,
        total: 5,
    },
} satisfies Meta<typeof TodayProgressRing>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Overflowing: Story = {
    name: 'Больше ста процентов',
    args: { done: 11, total: 10, percentage: 110 },
}

export const Empty: Story = {
    name: 'Ничего не запланировано',
    args: { done: 0, total: 0 },
}
