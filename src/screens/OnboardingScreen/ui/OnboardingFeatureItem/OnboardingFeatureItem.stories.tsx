import { lottie } from '@/shared/config/lottie'
import type { Meta, StoryObj } from '@storybook/react-native'

import { OnboardingFeatureItem } from './OnboardingFeatureItem'

const meta = {
    title: 'OnboardingScreen/OnboardingFeatureItem',
    component: OnboardingFeatureItem,
    args: {
        title: 'Удобный трекинг',
        description:
            'Статусы, приоритеты и группы — всё под рукой, прогресс виден сразу',
        animation: lottie.plus,
    },
} satisfies Meta<typeof OnboardingFeatureItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
