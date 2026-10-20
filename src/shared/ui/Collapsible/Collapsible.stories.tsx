import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { ComponentProps } from 'react'

import { Collapsible } from './Collapsible'

function Example({ visible, children }: ComponentProps<typeof Collapsible>) {
    const [isVisible, setIsVisible] = useState(visible)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setIsVisible((value) => !value)}
            >
                <Text>Переключить</Text>
            </Pressable>
            <Collapsible visible={isVisible}>{children}</Collapsible>
        </>
    )
}

const meta = {
    title: 'Shared/Collapsible',
    component: Collapsible,
    args: {
        visible: true,
        children: <Text>Скрываемое содержимое</Text>,
    },
    argTypes: {
        children: { control: false },
    },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
