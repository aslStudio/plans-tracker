import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import type { ComponentProps } from 'react'

import { defaultNotificationSettings } from '@/shared/api'

import { NotificationsScreen } from './NotificationsScreen'

function Example(args: ComponentProps<typeof NotificationsScreen>) {
    const [settings, setSettings] = useState(args.settings)
    return (
        <NotificationsScreen
            {...args}
            settings={settings}
            onToggleEnabled={(value) =>
                setSettings((current) => ({ ...current, enabled: value }))
            }
            onChangeSettings={(patch) =>
                setSettings((current) => ({ ...current, ...patch }))
            }
        />
    )
}

const meta = {
    title: 'NotificationsScreen',
    component: NotificationsScreen,
    args: {
        settings: { ...defaultNotificationSettings, enabled: true },
        permissionDenied: false,
        onClose: () => {},
        onToggleEnabled: () => {},
        onChangeSettings: () => {},
        onOpenSystemSettings: () => {},
    },
    argTypes: {
        settings: { control: false },
        onClose: { control: false },
        onToggleEnabled: { control: false },
        onChangeSettings: { control: false },
        onOpenSystemSettings: { control: false },
    },
} satisfies Meta<typeof NotificationsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}

export const PermissionDenied: Story = {
    name: 'Разрешение отклонено',
    args: { permissionDenied: true },
}
