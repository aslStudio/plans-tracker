import { lottie } from '@/shared/config/lottie'
import type { Meta, StoryObj } from '@storybook/react-native'

import { TheLottie } from './TheLottie'

const meta = {
    title: 'Shared/TheLottie',
    component: TheLottie,
    args: {
        source: lottie.streak,
        style: { width: 88, height: 88 },
        accessibilityLabel: 'Анимация серии привычек',
    },
    argTypes: {
        source: { control: false },
        onAnimationFinish: { control: false },
        onError: { control: false },
    },
} satisfies Meta<typeof TheLottie>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
