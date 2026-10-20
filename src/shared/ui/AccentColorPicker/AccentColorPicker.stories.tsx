import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'

import type { AccentColor } from '@/shared/config/color'

import { AccentColorPicker } from './AccentColorPicker'

function Example({ allowNoColor }: { allowNoColor?: boolean }) {
    const [value, setValue] = useState<AccentColor | null>('accent-turquoise')
    return (
        <AccentColorPicker
            value={value}
            allowNoColor={allowNoColor}
            onChange={setValue}
        />
    )
}

const meta = {
    title: 'Shared/AccentColorPicker',
    component: AccentColorPicker,
    args: { value: 'accent-turquoise', allowNoColor: false, onChange: () => {} },
    argTypes: {
        value: { control: false },
        onChange: { control: false },
        allowNoColor: { control: 'boolean' },
    },
} satisfies Meta<typeof AccentColorPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example allowNoColor={args.allowNoColor} />,
}
