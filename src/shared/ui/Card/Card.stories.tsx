import type { Meta, StoryObj } from '@storybook/react-native'
import { Text } from 'react-native'

import { Card } from './Card'

const meta = {
    title: 'Shared/Card',
    component: Card,
    args: {
        variant: 'secondary',
        children: <Text>Содержимое карточки</Text>,
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary'],
        },
        children: { control: false },
    },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
