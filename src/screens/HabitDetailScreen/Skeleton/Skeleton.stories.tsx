import type { Meta, StoryObj } from '@storybook/react-native'

import { HabitDetailSkeleton } from './Skeleton'

const meta = {
    title: 'HabitDetailScreen/Skeleton',
    component: HabitDetailSkeleton,
    args: {
        isNew: false,
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
    },
} satisfies Meta<typeof HabitDetailSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const New: Story = {
    name: 'Новая привычка',
    args: { isNew: true },
}
