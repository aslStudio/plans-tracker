import type { Meta, StoryObj } from '@storybook/react-native'

import { TaskDetailsSkeleton } from './Skeleton'

const meta = {
    title: 'TaskDetailsScreen/Skeleton',
    component: TaskDetailsSkeleton,
    args: {
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
    },
} satisfies Meta<typeof TaskDetailsSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
