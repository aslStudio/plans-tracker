import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import type { ComponentProps } from 'react'

import { EntityEditorSheet } from './EntityEditorSheet'

function Example(args: ComponentProps<typeof EntityEditorSheet>) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Pressable accessibilityRole="button" onPress={() => setOpen(true)}>
                <Text>Открыть редактор</Text>
            </Pressable>
            {open && (
                <EntityEditorSheet
                    {...args}
                    onClose={() => setOpen(false)}
                    onSubmit={() => setOpen(false)}
                />
            )}
        </>
    )
}

function EditingExample(args: ComponentProps<typeof EntityEditorSheet>) {
    const [open, setOpen] = useState(true)
    return open ? (
        <EntityEditorSheet
            {...args}
            onClose={() => setOpen(false)}
            onSubmit={() => setOpen(false)}
        />
    ) : (
        <></>
    )
}

const meta = {
    title: 'Shared/EntityEditorSheet',
    component: EntityEditorSheet,
    args: {
        title: 'Группа',
        allowNoColor: false,
        initialValue: { label: 'Работа', color: 'accent-turquoise' },
        onClose: () => {},
        onSubmit: () => {},
    },
    argTypes: {
        onClose: { control: false },
        onSubmit: { control: false },
        onDelete: { control: false },
        initialValue: { control: false },
    },
} satisfies Meta<typeof EntityEditorSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}

export const Editing: Story = {
    name: 'Редактирование с удалением',
    args: { onDelete: () => {} },
    render: (args) => <EditingExample {...args} />,
}
