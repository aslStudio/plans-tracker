import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable } from 'react-native'
import type { ComponentProps } from 'react'

import { TheText } from '@/shared/ui/TheText'

import { TasksCompletionCelebration } from './TasksCompletionCelebration'

function Example(args: ComponentProps<typeof TasksCompletionCelebration>) {
    const [visible, setVisible] = useState(false)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(true)}
            >
                <TheText>Показать праздник</TheText>
            </Pressable>
            <TasksCompletionCelebration
                {...args}
                visible={visible}
                onClose={() => setVisible(false)}
            />
        </>
    )
}

const meta = {
    title: 'TasksScreen/TasksCompletionCelebration',
    component: TasksCompletionCelebration,
    args: {
        visible: false,
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
    },
} satisfies Meta<typeof TasksCompletionCelebration>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
