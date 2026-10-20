import type { Meta, StoryObj } from '@storybook/react-native'
import { ScrollView, View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { Badge } from './Badge'

function Canvas({ children }: { children: React.ReactNode }) {
    const { colors } = useTheme()
    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: colors.backgroundGrouped.primary,
            }}
            contentContainerStyle={{ padding: 20, gap: 20 }}
        >
            {children}
        </ScrollView>
    )
}

const meta = {
    title: 'Shared/Badge',
    component: Badge,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    args: {
        view: 'primary',
        children: 'Новое',
    },
    argTypes: {
        view: {
            control: 'select',
            options: ['primary', 'secondary', 'tertiary'],
        },
        children: { control: 'text' },
    },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Views: Story = {
    name: 'Представления',
    render: (args) => (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {(['primary', 'secondary', 'tertiary'] as const).map((view) => (
                <Badge {...args} key={view} view={view}>
                    {view}
                </Badge>
            ))}
        </View>
    ),
}
