import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { ComponentProps } from 'react'

import { SkeletonText } from '@/shared/ui/SkeletonText'

import { SkeletonWrapper } from './SkeletonWrapper'

function Example(args: ComponentProps<typeof SkeletonWrapper>) {
    const [isLoading, setIsLoading] = useState(args.isLoading)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setIsLoading((value) => !value)}
            >
                <Text>Переключить загрузку</Text>
            </Pressable>
            <SkeletonWrapper {...args} isLoading={isLoading} />
        </>
    )
}

const meta = {
    title: 'Shared/SkeletonWrapper',
    component: SkeletonWrapper,
    args: {
        isLoading: true,
        skeleton: <SkeletonText width="60%" />,
        children: <Text>Реальный контент</Text>,
    },
    argTypes: {
        skeleton: { control: false },
        children: { control: false },
    },
} satisfies Meta<typeof SkeletonWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
