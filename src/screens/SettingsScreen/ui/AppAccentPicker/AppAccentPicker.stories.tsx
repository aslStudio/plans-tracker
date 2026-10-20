import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import type { ComponentProps } from 'react'

import type { AccentName } from '@/shared/config/theme'

import { AppAccentPicker } from './AppAccentPicker'

function Example(args: ComponentProps<typeof AppAccentPicker>) {
    const [value, setValue] = useState<AccentName>(args.value)
    return <AppAccentPicker value={value} onChange={setValue} />
}

const meta = {
    title: 'SettingsScreen/AppAccentPicker',
    component: AppAccentPicker,
    args: {
        value: 'turquoise',
        onChange: () => {},
    },
    argTypes: {
        onChange: { control: false },
    },
} satisfies Meta<typeof AppAccentPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}
