import type { Meta, StoryObj } from '@storybook/react-native'

import { DeletedDataResponse } from './index'

const meta = {
    title: 'Shared/DeletedDataResponse',
    component: DeletedDataResponse,
    args: {
        fullScreen: false,
        missing: false,
    },
} satisfies Meta<typeof DeletedDataResponse>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Missing: Story = {
    name: 'Недоступно (нет данных вовсе)',
    args: { missing: true },
}
