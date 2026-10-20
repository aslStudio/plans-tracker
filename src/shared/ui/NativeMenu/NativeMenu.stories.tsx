import type { Meta, StoryObj } from '@storybook/react-native'
import { Pressable, Text } from 'react-native'

import { NativeMenu } from './NativeMenu'
import type { NativeMenuItem } from './model'

const items: NativeMenuItem[] = [
    { key: 'low', label: 'Низкий', isActive: false, onPress: () => {} },
    { key: 'medium', label: 'Средний', isActive: true, onPress: () => {} },
    { key: 'high', label: 'Высокий', isActive: false, onPress: () => {} },
]

const meta = {
    title: 'Shared/NativeMenu',
    component: NativeMenu,
    args: {
        items,
        trigger: (
            <Pressable accessibilityRole="button">
                <Text>Открыть меню</Text>
            </Pressable>
        ),
    },
    argTypes: {
        items: { control: false },
        trigger: { control: false },
    },
} satisfies Meta<typeof NativeMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
