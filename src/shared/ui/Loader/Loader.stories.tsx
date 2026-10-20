import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { Loader } from './Loader'

const meta = {
    title: 'Shared/Loader',
    component: Loader,
    decorators: [
        (Story) => (
            <View style={{ flex: 1, padding: 24 }}>
                <Story />
            </View>
        ),
    ],
    args: { size: 48, color: '#208AEF', isAnimated: true },
    argTypes: {
        size: { control: { type: 'number', min: 1 } },
        color: { control: 'color' },
        isAnimated: { control: 'boolean' },
    },
} satisfies Meta<typeof Loader>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Sizes: Story = {
    name: 'Размеры',
    render: (args) => (
        <View
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
            }}
        >
            {[12, 24, 48, 56, 96].map((size) => (
                <Loader key={size} {...args} size={size} />
            ))}
        </View>
    ),
}

export const AnimationStates: Story = {
    name: 'Анимация и статичное состояние',
    render: (args) => (
        <View style={{ flexDirection: 'row', gap: 24 }}>
            <Loader {...args} isAnimated />
            <Loader {...args} isAnimated={false} />
        </View>
    ),
}
