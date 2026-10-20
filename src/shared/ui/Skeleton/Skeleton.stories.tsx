import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { Skeleton } from './Skeleton'

const meta = {
    title: 'Shared/Skeleton',
    component: Skeleton,
    args: {
        style: { width: 120, height: 40 },
        borderRadius: 12,
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 16 }}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Circle: Story = {
    name: 'Круг',
    args: {
        style: { width: 68, height: 68 },
        borderRadius: 34,
    },
}
