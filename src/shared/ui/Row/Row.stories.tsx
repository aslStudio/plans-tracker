import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { Icon } from '@/shared/ui/Icon'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheText } from '@/shared/ui/TheText'
import { Toggle } from '@/shared/ui/Toggle'

import { Row } from './Row'
import { RowIconBubble } from './RowIconBubble'

const meta = {
    title: 'Shared/Row',
    component: Row,
    args: { label: 'Notifications' },
    argTypes: {
        icon: { control: false },
        RightElement: { control: false },
        onPress: { control: false },
    },
    decorators: [
        (Story) => (
            <View style={{ padding: 16 }}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Row>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const NavigationVariant: Story = {
    name: 'Переход (шеврон)',
    render: () => (
        <Section>
            <Row
                icon={
                    <RowIconBubble
                        icon={<Icon name="bell" color="gray-white" size={18} />}
                    />
                }
                label="Notifications"
                RightElement={
                    <Icon name="chevron-right" color="labels-tertiary" />
                }
                onPress={() => {}}
            />
            <Separator offsetLeft={64} />
            <Row
                icon={
                    <RowIconBubble
                        icon={
                            <Icon name="person" color="gray-white" size={18} />
                        }
                    />
                }
                label="Personal Details"
                RightElement={
                    <Icon name="chevron-right" color="labels-tertiary" />
                }
                onPress={() => {}}
            />
        </Section>
    ),
}

export const SquircleIconVariant: Story = {
    name: 'Скруглённый квадрат (иконка)',
    render: () => (
        <Section>
            <Row
                icon={
                    <RowIconBubble
                        shape="squircle"
                        icon={<Icon name="bell" color="gray-white" size={18} />}
                    />
                }
                label="Notifications"
                RightElement={
                    <Icon name="chevron-right" color="labels-tertiary" />
                }
                onPress={() => {}}
            />
            <Separator offsetLeft={64} />
            <Row
                icon={
                    <RowIconBubble
                        shape="squircle"
                        backgroundColor="background-secondary"
                        icon={<Icon name="heart" size={18} />}
                    />
                }
                label="Apple Health"
                RightElement={
                    <Icon name="chevron-right" color="labels-tertiary" />
                }
                onPress={() => {}}
            />
        </Section>
    ),
}

export const ToggleVariant: Story = {
    name: 'Тогл',
    render: () => (
        <Section>
            <Row
                label="Friend Updates"
                RightElement={<Toggle value={true} onChange={() => {}} />}
            />
        </Section>
    ),
}

export const DropdownVariant: Story = {
    name: 'Дропдаун',
    render: () => (
        <Section>
            <Row
                label="Appearance"
                RightElement={
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <TheText size="body" color="labels-secondary">
                            System
                        </TheText>
                        <Icon
                            name="chevron-up-down"
                            color="labels-tertiary"
                            size={20}
                        />
                    </View>
                }
                onPress={() => {}}
            />
        </Section>
    ),
}

export const ValueVariant: Story = {
    name: 'Значение (барабан)',
    render: () => (
        <Section>
            <Row
                label="Date of Birth"
                RightElement={
                    <TheText size="body" color="labels-secondary">
                        July 11, 1998
                    </TheText>
                }
                onPress={() => {}}
            />
        </Section>
    ),
}

export const LinkVariant: Story = {
    name: 'Ссылка',
    render: () => (
        <Section>
            <Row label="Terms of Use" labelColor="brand" onPress={() => {}} />
        </Section>
    ),
}

export const WithDescription: Story = {
    name: 'С подписью слева',
    render: () => (
        <Section>
            <Row
                icon={
                    <View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: '#ccc',
                        }}
                    />
                }
                label="Roxman"
                description="Profile"
                RightElement={
                    <Icon name="chevron-right" color="labels-tertiary" />
                }
                onPress={() => {}}
            />
        </Section>
    ),
}

export const Disabled: Story = {
    name: 'Отключено',
    render: () => (
        <Section>
            <Row
                label="Notifications"
                RightElement={
                    <Toggle value={false} onChange={() => {}} disabled />
                }
                disabled
            />
        </Section>
    ),
}
