import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { ScreenGradientBackground } from './ScreenGradientBackground'

function Canvas() {
    const { colors } = useTheme()
    return (
        <View
            style={{
                flex: 1,
                height: 320,
                backgroundColor: colors.backgroundGrouped.primary,
            }}
        >
            <ScreenGradientBackground />
        </View>
    )
}

const meta = {
    title: 'Shared/ScreenGradientBackground',
    component: ScreenGradientBackground,
} satisfies Meta<typeof ScreenGradientBackground>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: () => <Canvas />,
}
