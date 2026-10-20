import type { Meta, StoryObj } from '@storybook/react-native'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { fn } from 'storybook/test'

import { type AccentName, Colors } from '@/shared/config/theme'
import { useTheme } from '@/shared/lib/theme/use-theme'

import {
    DefaultTextColor,
    DefaultTextFont,
    DefaultTextSize,
    DefaultTextWeight,
    TextColorValues,
    TextFontValues,
    TextSizeValues,
    TextWeightValues,
    type TheTextProps,
} from './model'
import { TheText } from './TheText'

function Canvas({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: theme.colors.background.primary,
            }}
            contentContainerStyle={{ padding: 20, gap: 24 }}
        >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['light', 'dark', 'system'] as const).map((mode) => (
                    <Pressable
                        key={mode}
                        onPress={() => theme.setThemeMode(mode)}
                        accessibilityRole="button"
                        accessibilityState={{
                            selected: theme.themeMode === mode,
                        }}
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            backgroundColor:
                                theme.themeMode === mode
                                    ? theme.colors.brand
                                    : theme.colors.fill.tertiary,
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    theme.themeMode === mode
                                        ? '#fff'
                                        : theme.colors.labels.primary,
                            }}
                        >
                            {mode}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {(Object.keys(Colors.light.accent) as AccentName[]).map(
                    (accent) => (
                        <Pressable
                            key={accent}
                            accessibilityRole="button"
                            accessibilityLabel={`Акцент: ${accent}`}
                            accessibilityState={{
                                selected:
                                    theme.colors.selectedAccent === accent,
                            }}
                            onPress={() => theme.colors.setAccentColor(accent)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: theme.colors.accent[accent],
                                borderWidth:
                                    theme.colors.selectedAccent === accent
                                        ? 3
                                        : 0,
                                borderColor: theme.colors.labels.primary,
                            }}
                        />
                    ),
                )}
            </View>
            {children}
        </ScrollView>
    )
}

const meta = {
    title: 'Shared/TheText',
    component: TheText,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    args: {
        children: 'Привет, plans-tracker! Aa Бб 0123456789',
        tag: 'text',
        size: DefaultTextSize,
        weight: DefaultTextWeight,
        font: DefaultTextFont,
        color: DefaultTextColor,
        onPress: fn(),
    },
    argTypes: {
        children: {
            control: 'text',
            description: 'Текст для проверки кириллицы, цифр и переносов',
        },
        size: { control: 'select', options: TextSizeValues },
        weight: { control: 'select', options: TextWeightValues },
        font: { control: 'select', options: TextFontValues },
        color: { control: 'select', options: TextColorValues },
        tag: { control: false },
        numberOfLines: { control: { type: 'number', min: 0, step: 1 } },
        selectable: { control: 'boolean' },
        allowFontScaling: { control: 'boolean' },
        onPress: { control: false },
        style: { control: 'object' },
    },
} satisfies Meta<typeof TheText>

export default meta
type Story = StoryObj<TheTextProps>

export const Playground: Story = { name: 'Песочница' }

export const AllVariants: Story = {
    name: 'Все варианты',
    render: (args: TheTextProps) => (
        <View style={{ gap: 28 }}>
            <TheText weight="700" size="title-2">
                Размеры
            </TheText>
            {TextSizeValues.map((size) => (
                <View key={size} style={{ gap: 6 }}>
                    <TheText size="caption-1" color="labels-secondary">
                        {size}
                    </TheText>
                    <TheText {...args} tag="text" size={size} />
                </View>
            ))}
            <TheText weight="700" size="title-2">
                Шрифты × начертания
            </TheText>
            {TextFontValues.flatMap((font) =>
                TextWeightValues.map((weight) => (
                    <View key={`${font}-${weight}`} style={{ gap: 6 }}>
                        <TheText size="caption-1" color="labels-secondary">
                            {font} / {weight}
                        </TheText>
                        <TheText
                            {...args}
                            tag="text"
                            font={font}
                            weight={weight}
                        />
                    </View>
                )),
            )}
            <TheText weight="700" size="title-2">
                Цвета
            </TheText>
            {TextColorValues.map((color) => (
                <View key={color} style={{ gap: 6 }}>
                    <TheText size="caption-1" color="labels-secondary">
                        {color}
                    </TheText>
                    <TheText {...args} tag="text" color={color} />
                </View>
            ))}
        </View>
    ),
}

export const Link: Story = {
    name: 'Ссылка',
    args: {
        tag: 'link',
        href: 'https://expo.dev',
        children: 'Открыть Expo ↗',
        color: 'brand',
    },
    argTypes: { href: { control: 'text' } },
}

export const LongText: Story = {
    name: 'Длинный текст и обрезка',
    args: {
        children:
            'Длинный текст для проверки переносов и обрезки. Измените numberOfLines в Controls: 0 — без ограничения. '.repeat(
                4,
            ),
        numberOfLines: 3,
        selectable: true,
    },
}
