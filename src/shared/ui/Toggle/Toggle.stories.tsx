import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { View } from 'react-native'

import { Toggle } from './Toggle'

function Example({ disabled }: { disabled?: boolean }) {
    const [value, setValue] = useState(false)
    return <Toggle value={value} onChange={setValue} disabled={disabled} />
}

const meta = {
    title: 'Shared/Toggle',
    component: Toggle,
    args: { value: false, onChange: () => {} },
    argTypes: {
        value: { control: false },
        onChange: { control: false },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example disabled={args.disabled} />,
}

export const States: Story = {
    name: 'Состояния',
    render: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
            <Toggle value={false} onChange={() => {}} />
            <Toggle value={true} onChange={() => {}} />
            <Toggle value={false} onChange={() => {}} disabled />
            <Toggle value={true} onChange={() => {}} disabled />
        </View>
    ),
}
