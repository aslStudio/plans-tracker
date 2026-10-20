import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { AnimatedColorSwatch } from './AnimatedColorSwatch'
import type { ComponentProps } from 'react'

function Example(args: ComponentProps<typeof AnimatedColorSwatch>) {
    const [selected, setSelected] = useState(args.selected)
    return (
        <AnimatedColorSwatch
            {...args}
            selected={selected}
            onPress={() => setSelected((value) => !value)}
        />
    )
}

function Row(args: ComponentProps<typeof AnimatedColorSwatch>) {
    return (
        <View style={styles.row}>
            {['#087F78', '#339E89', '#D99539', '#D36B91'].map(
                (color, index) => (
                    <AnimatedColorSwatch
                        {...args}
                        key={color}
                        color={color}
                        selected={index === 0}
                        accessibilityLabel={color}
                    />
                ),
            )}
        </View>
    )
}

const meta = {
    title: 'Shared/AnimatedColorSwatch',
    component: AnimatedColorSwatch,
    args: {
        color: '#548CBF',
        selected: false,
        accessibilityLabel: 'Синий',
        onPress: () => {},
    },
    argTypes: {
        onPress: { control: false },
    },
} satisfies Meta<typeof AnimatedColorSwatch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}

export const RowStory: Story = {
    name: 'Ряд',
    render: (args) => <Row {...args} />,
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 8 },
})
