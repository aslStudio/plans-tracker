import type { Meta, StoryObj } from '@storybook/react-native'

import { ONBOARDING_SLIDES } from '../../data'
import { OnboardingSlide } from './OnboardingSlide'

const meta = {
    title: 'OnboardingScreen/OnboardingSlide',
    component: OnboardingSlide,
    args: {
        slide: ONBOARDING_SLIDES[0],
        width: 360,
    },
    argTypes: {
        slide: { control: false },
    },
} satisfies Meta<typeof OnboardingSlide>

export default meta
type Story = StoryObj<typeof meta>

export const Tasks: Story = { name: 'Задачи' }

export const Habits: Story = {
    name: 'Привычки',
    args: { slide: ONBOARDING_SLIDES[1] },
}

export const Calendar: Story = {
    name: 'Календарь',
    args: { slide: ONBOARDING_SLIDES[2] },
}

export const Settings: Story = {
    name: 'Настройки',
    args: { slide: ONBOARDING_SLIDES[3] },
}
