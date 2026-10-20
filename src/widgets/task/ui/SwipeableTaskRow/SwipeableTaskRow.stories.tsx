import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { TheText } from '@/shared/ui/TheText'

import { SwipeableTaskRow } from './SwipeableTaskRow'

const meta = {
    title: 'TasksScreen/SwipeableTaskRow',
    component: SwipeableTaskRow,
    args: {
        taskId: 't1',
        isCompleted: false,
        onComplete: () => {},
        onDelete: () => {},
        onEdit: () => {},
        children: (
            <View>
                <TheText>Собрать чемодан</TheText>
            </View>
        ),
    },
    argTypes: {
        onComplete: { control: false },
        onDelete: { control: false },
        onEdit: { control: false },
        children: { control: false },
    },
} satisfies Meta<typeof SwipeableTaskRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Overdue: Story = {
    name: 'Просроченная задача',
    args: { onEdit: () => {} },
}
