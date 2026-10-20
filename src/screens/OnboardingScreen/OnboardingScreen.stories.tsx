import type { Meta, StoryObj } from '@storybook/react-native'

import { OnboardingScreen } from './OnboardingScreen'

const meta = {
    title: 'OnboardingScreen',
    component: OnboardingScreen,
    args: {
        onFinish: () => {},
    },
    argTypes: {
        onFinish: { control: false },
    },
} satisfies Meta<typeof OnboardingScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
