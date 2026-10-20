import type { Meta, StoryObj } from '@storybook/react-native'
import { ScrollView, View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'

import { Placeholder } from './Placeholder'

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
    title: 'Shared/Placeholder',
    component: Placeholder,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    args: {
        size: 'default',
        title: 'Здесь пока пусто',
        description: 'Добавьте первую запись, чтобы увидеть её здесь',
    },
    argTypes: {
        size: { control: 'select', options: ['default', 'large'] },
        title: { control: 'text' },
        description: { control: 'text' },
    },
} satisfies Meta<typeof Placeholder>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Sizes: Story = {
    name: 'Размеры',
    render: (args) => (
        <View style={{ gap: 16 }}>
            <Placeholder {...args} size="default" />
            <Placeholder {...args} size="large" />
        </View>
    ),
}

export const WithIcon: Story = {
    name: 'С иконкой',
    render: (args) => (
        <Placeholder {...args}>
            <Icon name="search-outline" size={40} color="labels-secondary" />
        </Placeholder>
    ),
}

export const WithoutDescription: Story = {
    name: 'Без описания',
    args: { description: undefined },
}
