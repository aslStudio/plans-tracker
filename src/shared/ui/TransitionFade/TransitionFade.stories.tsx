import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { ComponentProps } from 'react'

import { TransitionFade } from './TransitionFade'

function Example(args: ComponentProps<typeof TransitionFade>) {
    const [loading, setLoading] = useState(args.loading)
    return (
        <>
            <Pressable
                accessibilityRole="button"
                onPress={() => setLoading((value) => !value)}
            >
                <Text>Переключить</Text>
            </Pressable>
            <TransitionFade {...args} loading={loading} />
        </>
    )
}

const meta = {
    title: 'Shared/TransitionFade',
    component: TransitionFade,
    args: {
        loading: true,
        skeleton: <Text>Загрузка…</Text>,
        children: <Text>Готово</Text>,
    },
    argTypes: {
        skeleton: { control: false },
        children: { control: false },
    },
} satisfies Meta<typeof TransitionFade>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
