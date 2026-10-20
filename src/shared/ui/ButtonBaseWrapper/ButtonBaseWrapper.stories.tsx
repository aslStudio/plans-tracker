import type { Meta, StoryObj } from '@storybook/react-native'
import { Text } from 'react-native'

import { ButtonBaseWrapper } from './ButtonBaseWrapper'

const meta = {
    title: 'Shared/ButtonBaseWrapper',
    component: ButtonBaseWrapper,
    args: {
        height: 52,
        variant: 'primary',
        view: 'brand',
        children: <Text>Действие</Text>,
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'plain'],
        },
        children: { control: false },
        onPress: { control: false },
    },
} satisfies Meta<typeof ButtonBaseWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Disabled: Story = {
    name: 'Отключена',
    args: { isDisabled: true },
}

export const Loading: Story = {
    name: 'Загрузка',
    args: { isLoading: true },
}
