import type { Meta, StoryObj } from '@storybook/react-native'
import type { ComponentType } from 'react'
import { Pressable, Text, View } from 'react-native'

import { icons } from '@/shared/config/icons'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { TextColorValues } from '@/shared/ui/TheText/model'

import { Icon } from './Icon'
import { IconAnimated } from './IconAnimated'
import { IconSkeleton } from './IconSkeleton'
import { type MonoProps } from './model'

const MonoIcon = Icon as ComponentType<MonoProps>

function Canvas({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    return (
        <View
            style={{
                flex: 1,
                padding: 24,
                gap: 24,
                backgroundColor: theme.colors.background.primary,
            }}
        >
            <Pressable
                accessibilityRole="button"
                onPress={() =>
                    theme.setThemeMode(
                        theme.colorScheme === 'light' ? 'dark' : 'light',
                    )
                }
            >
                <Text style={{ color: theme.colors.brand }}>
                    Сменить тему ({theme.colorScheme})
                </Text>
            </Pressable>
            {children}
        </View>
    )
}

const meta = {
    title: 'Shared/Icon',
    component: MonoIcon,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    args: { name: 'search-outline', size: 48, color: 'brand' },
    argTypes: {
        name: { control: 'select', options: icons },
        size: { control: { type: 'number', min: 0 } },
        width: { control: { type: 'number', min: 0 } },
        height: { control: { type: 'number', min: 0 } },
        color: {
            control: 'select',
            options: TextColorValues,
        },
        nativeColor: { control: 'color' },
    },
} satisfies Meta<typeof MonoIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = { name: 'Песочница' }
export const AnimatedColor: Story = {
    name: 'Анимация цвета',
    render: (args) => <IconAnimated {...args} />,
}
export const Skeleton: Story = {
    name: 'Скелетон',
    render: (args) => <IconSkeleton size={args.size ?? 24} />,
}
