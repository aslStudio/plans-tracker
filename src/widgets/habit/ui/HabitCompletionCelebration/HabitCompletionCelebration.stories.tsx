import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable } from 'react-native'
import type { ComponentProps } from 'react'

import { TheText } from '@/shared/ui/TheText'

import { HabitCompletionCelebration } from './HabitCompletionCelebration'

function Example(args: ComponentProps<typeof HabitCompletionCelebration>) {
    const [visible, setVisible] = useState(false)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(true)}
            >
                <TheText>Показать праздник</TheText>
            </Pressable>
            <HabitCompletionCelebration
                {...args}
                visible={visible}
                onClose={() => setVisible(false)}
            />
        </>
    )
}

const meta = {
    title: 'HabitsScreen/HabitCompletionCelebration',
    component: HabitCompletionCelebration,
    args: {
        visible: false,
        previousStreak: 4,
        streak: 5,
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
    },
} satisfies Meta<typeof HabitCompletionCelebration>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
