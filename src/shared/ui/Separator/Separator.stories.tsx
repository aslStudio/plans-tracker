import type { Meta, StoryObj } from '@storybook/react-native'
import { ScrollView, View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheText } from '@/shared/ui/TheText'

import { type SeparatorProps } from './model'
import { Separator } from './Separator'

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
    title: 'Shared/Separator',
    component: Separator,
    decorators: [
        (Story) => (
            <Canvas>
                <Story />
            </Canvas>
        ),
    ],
    argTypes: {
        style: { control: false },
    },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

function ListDemo(args: SeparatorProps) {
    const { colors } = useTheme()
    const rows = ['Первая строка', 'Вторая строка', 'Третья строка']
    return (
        <View
            style={{
                backgroundColor: colors.background.elevated,
                borderRadius: 16,
                paddingHorizontal: 16,
            }}
        >
            {rows.map((row, index) => (
                <View key={row}>
                    <View style={{ paddingVertical: 14 }}>
                        <TheText>{row}</TheText>
                    </View>
                    {index < rows.length - 1 && <Separator {...args} />}
                </View>
            ))}
        </View>
    )
}

export const InList: Story = {
    name: 'В списке',
    render: (args) => <ListDemo {...args} />,
}

export const Indented: Story = {
    name: 'С отступом',
    args: { style: { marginLeft: 16 } },
}
