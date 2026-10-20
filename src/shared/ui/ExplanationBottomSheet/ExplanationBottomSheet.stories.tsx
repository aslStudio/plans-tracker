import { lottie } from '@/shared/config/lottie'
import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { ComponentProps } from 'react'

import { ExplanationBottomSheet } from './ExplanationBottomSheet'

function Example(args: ComponentProps<typeof ExplanationBottomSheet>) {
    const [visible, setVisible] = useState(false)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(true)}
            >
                <Text>Показать пояснение</Text>
            </Pressable>
            <ExplanationBottomSheet
                {...args}
                visible={visible}
                onClose={() => setVisible(false)}
            />
        </>
    )
}

const meta = {
    title: 'Shared/ExplanationBottomSheet',
    component: ExplanationBottomSheet,
    args: {
        visible: false,
        title: 'Повторяющиеся задачи',
        description:
            'Включите повторение, чтобы задавать расписание задачи и автоматически видеть её будущие появления в календаре.',
        animation: lottie.warning,
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
        animation: { control: false },
    },
} satisfies Meta<typeof ExplanationBottomSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
