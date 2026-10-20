import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { TextSizeValues } from '@/shared/ui/TheText'

import { SkeletonText } from './SkeletonText'

const meta = {
    title: 'Shared/SkeletonText',
    component: SkeletonText,
    args: {
        size: 'body',
        width: '70%',
    },
    argTypes: {
        size: { control: 'select', options: TextSizeValues },
    },
} satisfies Meta<typeof SkeletonText>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Paragraph: Story = {
    name: 'Абзац',
    render: () => (
        <View style={{ gap: 8 }}>
            <SkeletonText size="title-1" width="60%" />
            <SkeletonText width="100%" />
            <SkeletonText width="92%" />
            <SkeletonText width="68%" />
        </View>
    ),
}
