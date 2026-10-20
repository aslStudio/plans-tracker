import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable } from 'react-native'
import type { ComponentProps } from 'react'

import { TheText } from '@/shared/ui/TheText'

import { OverdueTasksReminder } from './OverdueTasksReminder'

function Example(args: ComponentProps<typeof OverdueTasksReminder>) {
    const [visible, setVisible] = useState(false)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(true)}
            >
                <TheText>Показать напоминание</TheText>
            </Pressable>
            <OverdueTasksReminder
                {...args}
                visible={visible}
                onClose={() => setVisible(false)}
            />
        </>
    )
}

const meta = {
    title: 'TasksScreen/OverdueTasksReminder',
    component: OverdueTasksReminder,
    args: {
        visible: false,
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
    },
} satisfies Meta<typeof OverdueTasksReminder>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
