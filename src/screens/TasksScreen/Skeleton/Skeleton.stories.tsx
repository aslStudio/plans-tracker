import type { Meta, StoryObj } from '@storybook/react-native'

import { Skeleton } from './Skeleton'

const meta = {
    title: 'Screens/TasksScreen/Skeleton',
    component: Skeleton,
    parameters: { noSafeArea: true },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
