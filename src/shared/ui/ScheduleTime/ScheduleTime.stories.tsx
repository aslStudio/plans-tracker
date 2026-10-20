import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import type { ComponentProps } from 'react'

import { ScheduleTime } from './ScheduleTime'

function Example(args: ComponentProps<typeof ScheduleTime>) {
    const [minute, setMinute] = useState<number | null>(args.minute)
    const [duration, setDuration] = useState(args.duration ?? 60)
    return (
        <ScheduleTime
            minute={minute}
            duration={duration}
            onChange={(nextMinute, nextDuration) => {
                setMinute(nextMinute)
                setDuration(nextDuration)
            }}
        />
    )
}

const meta = {
    title: 'Shared/ScheduleTime',
    component: ScheduleTime,
    args: {
        minute: 540,
        duration: 60,
        onChange: () => {},
    },
    argTypes: {
        onChange: { control: false },
    },
} satisfies Meta<typeof ScheduleTime>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <Example {...args} />,
}

export const Unscheduled: Story = {
    name: 'Без времени',
    args: { minute: null },
}
