import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { TheText } from '@/shared/ui/TheText'

import { SwipeableHabitRow } from './SwipeableHabitRow'

const meta = {
    title: 'HabitsScreen/SwipeableHabitRow',
    component: SwipeableHabitRow,
    args: {
        habitId: 'h1',
        onDelete: () => {},
        children: (
            <View>
                <TheText>Тренировка</TheText>
            </View>
        ),
    },
    argTypes: {
        onDelete: { control: false },
        children: { control: false },
    },
} satisfies Meta<typeof SwipeableHabitRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
