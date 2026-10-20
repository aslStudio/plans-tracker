import type { Meta, StoryObj } from '@storybook/react-native'
import { Text } from 'react-native'

import { Row } from '@/shared/ui/Row'
import { Separator } from '@/shared/ui/Separator'
import { TheText } from '@/shared/ui/TheText'

import { Section } from './Section'

const meta = {
    title: 'Shared/Section',
    component: Section,
    args: {
        children: <Text>Содержимое секции</Text>,
    },
    argTypes: {
        children: { control: false },
        TopElement: { control: false },
        BottomElement: { control: false },
    },
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const WithRows: Story = {
    name: 'Со строками',
    render: (args) => (
        <Section
            {...args}
            TopElement={
                <TheText weight="600" color="labels-secondary">
                    Задачи
                </TheText>
            }
        >
            <Row label="Группы" />
            <Separator offsetLeft={16} />
            <Row label="Приоритет" />
        </Section>
    ),
}
