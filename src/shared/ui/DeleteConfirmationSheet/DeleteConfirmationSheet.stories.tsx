import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { ComponentProps } from 'react'

import { DeleteConfirmationSheet } from './DeleteConfirmationSheet'

function Example(args: ComponentProps<typeof DeleteConfirmationSheet>) {
    const [visible, setVisible] = useState(false)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(true)}
            >
                <Text>Открыть подтверждение</Text>
            </Pressable>
            <DeleteConfirmationSheet
                {...args}
                visible={visible}
                onCancel={() => setVisible(false)}
                onConfirm={() => setVisible(false)}
            />
        </>
    )
}

const meta = {
    title: 'Shared/DeleteConfirmationSheet',
    component: DeleteConfirmationSheet,
    args: {
        visible: false,
        onCancel: () => {},
        onConfirm: () => {},
    },
    argTypes: {
        onCancel: { control: false },
        onConfirm: { control: false },
    },
} satisfies Meta<typeof DeleteConfirmationSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
