import type { Meta, StoryObj } from '@storybook/react-native'

import { EventEditorSkeleton } from './Skeleton'

const meta = {
    title: 'PlannerScreen/EventEditorSkeleton',
    component: EventEditorSkeleton,
    args: {
        isNew: false,
        onClose: () => {},
    },
    argTypes: {
        onClose: { control: false },
    },
} satisfies Meta<typeof EventEditorSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const New: Story = {
    name: 'Новый план',
    args: { isNew: true },
}
