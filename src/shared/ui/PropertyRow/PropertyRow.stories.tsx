import type { Meta, StoryObj } from '@storybook/react-native'

import type { NativeMenuItem } from '@/shared/ui/NativeMenu'

import { PropertyRow } from './PropertyRow'

const items: NativeMenuItem[] = [
    { key: 'low', label: 'Низкий', isActive: false, onPress: () => {} },
    { key: 'medium', label: 'Средний', isActive: true, onPress: () => {} },
    { key: 'high', label: 'Высокий', isActive: false, onPress: () => {} },
]

const meta = {
    title: 'Shared/PropertyRow',
    component: PropertyRow,
    args: {
        label: 'Приоритет',
        valueLabel: 'Средний',
        valueColor: 'accent-yellow',
        items,
    },
    argTypes: {
        items: { control: false },
    },
} satisfies Meta<typeof PropertyRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
