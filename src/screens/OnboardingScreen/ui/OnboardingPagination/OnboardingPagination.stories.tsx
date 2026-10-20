import type { Meta, StoryObj } from '@storybook/react-native'
import { makeMutable } from 'react-native-reanimated'

import { OnboardingPagination } from './OnboardingPagination'

const PAGE_WIDTH = 320

const meta = {
    title: 'OnboardingScreen/OnboardingPagination',
    component: OnboardingPagination,
    args: {
        count: 4,
        pageWidth: PAGE_WIDTH,
        scrollX: makeMutable(0),
    },
    argTypes: {
        scrollX: { control: false },
    },
} satisfies Meta<typeof OnboardingPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const SecondActive: Story = {
    name: 'Активна вторая точка',
    args: { scrollX: makeMutable(PAGE_WIDTH) },
}

export const LastActive: Story = {
    name: 'Активна последняя точка',
    args: { scrollX: makeMutable(PAGE_WIDTH * 3) },
}
