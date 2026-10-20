import type { Meta, StoryObj } from '@storybook/react-native'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { fn } from 'storybook/test'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { TheButton } from './TheButton'

function Canvas({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: theme.colors.backgroundGrouped.primary,
            }}
            contentContainerStyle={{ padding: 20, gap: 20 }}
        >
            {children}
        </ScrollView>
    )
}

const meta = {
    title: 'Shared/TheButton',
    component: TheButton,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    args: {
        children: 'Продолжить',
        size: '52',
        variant: 'primary',
        view: 'brand',
        isLiquidGlass: true,
        isDisabled: false,
        isLoading: false,
        isWide: true,
        onPress: fn(),
    },
    argTypes: {
        size: { control: 'select', options: ['52', '44', '36', '28'] },
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'plain'],
        },
        view: {
            control: 'select',
            options: ['brand', 'destructive', 'neutral', 'overlay', 'grouped'],
        },
        isLiquidGlass: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        isLoading: { control: 'boolean' },
        isWide: { control: 'boolean' },
        iconLeft: {
            control: 'select',
            options: [undefined, 'search-outline', 'plus'],
        },
        iconRight: {
            control: 'select',
            options: [undefined, 'search-outline'],
        },
        onPress: { action: 'pressed' },
    },
} satisfies Meta<typeof TheButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Variants: Story = {
    name: 'Варианты и представления',
    render: (args) => (
        <View style={{ gap: 16 }}>
            {(['primary', 'secondary', 'plain'] as const).flatMap((variant) =>
                (['brand', 'destructive', 'neutral'] as const).map((view) => (
                    <TheButton
                        {...args}
                        key={`${variant}-${view}`}
                        variant={variant}
                        view={view}
                    >
                        {variant} / {view}
                    </TheButton>
                )),
            )}
        </View>
    ),
}

export const Sizes: Story = {
    name: 'Размеры',
    render: (args) => (
        <View style={{ gap: 16, alignItems: 'flex-start' }}>
            {(['52', '44', '36', '28'] as const).map((size) => (
                <TheButton {...args} key={size} size={size}>
                    Размер {size}
                </TheButton>
            ))}
        </View>
    ),
}

export const Widths: Story = {
    name: 'Ширина',
    render: (args) => (
        <View style={{ gap: 16, width: '100%' }}>
            <TheButton {...args} isWide={false}>
                По содержимому
            </TheButton>
            <TheButton {...args} isWide>
                На всю ширину
            </TheButton>
        </View>
    ),
}

export const WithIcons: Story = {
    name: 'С иконками',
    args: { iconLeft: 'search-outline', iconRight: 'search-outline' },
}

export const States: Story = {
    name: 'Состояния',
    render: (args) => (
        <View style={{ gap: 16, alignItems: 'flex-start' }}>
            <TheButton {...args}>Обычная</TheButton>
            <TheButton {...args} isDisabled>
                Заблокирована
            </TheButton>
            <TheButton {...args} isLoading>
                <ActivityIndicator />
            </TheButton>
        </View>
    ),
}

export const Neutral: Story = {
    name: 'Нейтральные кнопки',
    args: { view: 'neutral' },
    render: (args) => (
        <View style={{ gap: 16, alignItems: 'flex-start' }}>
            {(['primary', 'secondary', 'plain'] as const).map((variant) => (
                <TheButton {...args} key={variant} variant={variant}>
                    Нейтральная {variant}
                </TheButton>
            ))}
        </View>
    ),
}

export const Grouped: Story = {
    name: 'На группированном фоне',
    args: { view: 'grouped' },
    render: (args) => (
        <View style={{ gap: 16, alignItems: 'flex-start' }}>
            {(['primary', 'secondary', 'plain'] as const).map((variant) => (
                <TheButton {...args} key={variant} variant={variant}>
                    Grouped {variant}
                </TheButton>
            ))}
        </View>
    ),
}
