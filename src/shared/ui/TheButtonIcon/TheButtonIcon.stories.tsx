import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'
import { fn } from 'storybook/test'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { TheButtonIcon } from './TheButtonIcon'

function Canvas({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    return (
        <View
            style={{
                flex: 1,
                width: '100%',
                padding: 20,
                gap: 20,
                backgroundColor: theme.colors.backgroundGrouped.primary,
            }}
        >
            {children}
        </View>
    )
}

const meta = {
    title: 'Shared/TheButtonIcon',
    component: TheButtonIcon,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    args: {
        icon: 'search-outline',
        size: '52',
        variant: 'primary',
        view: 'brand',
        isLiquidGlass: true,
        isWide: false,
        isDisabled: false,
        isLoading: false,
        onPress: fn(),
    },
    argTypes: {
        icon: {
            control: 'select',
            options: ['search-outline', 'plus', 'star', 'trash'],
        },
        size: {
            control: 'select',
            options: ['52', '44', '40', '36', '28', '22'],
        },
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'plain'],
        },
        view: {
            control: 'select',
            options: ['brand', 'destructive', 'neutral', 'overlay', 'grouped'],
        },
        isLiquidGlass: { control: 'boolean' },
        isWide: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        isLoading: { control: 'boolean' },
        onPress: { action: 'pressed' },
    },
} satisfies Meta<typeof TheButtonIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Variants: Story = {
    name: 'Варианты и представления',
    render: (args) => (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {(['primary', 'secondary', 'plain'] as const).flatMap((variant) =>
                (
                    [
                        'brand',
                        'destructive',
                        'neutral',
                        'overlay',
                        'grouped',
                    ] as const
                ).map((view) => (
                    <TheButtonIcon
                        {...args}
                        key={`${variant}-${view}`}
                        variant={variant}
                        view={view}
                    />
                )),
            )}
        </View>
    ),
}

export const Sizes: Story = {
    name: 'Размеры',
    render: (args) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {(['52', '44', '40', '36', '28', '22'] as const).map((size) => (
                <TheButtonIcon {...args} key={size} size={size} />
            ))}
        </View>
    ),
}

export const Wide: Story = {
    name: 'На всю ширину',
    args: { isWide: true },
}

export const States: Story = {
    name: 'Состояния',
    render: (args) => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
            <TheButtonIcon {...args} />
            <TheButtonIcon {...args} isDisabled />
            <TheButtonIcon {...args} isLoading />
        </View>
    ),
}
