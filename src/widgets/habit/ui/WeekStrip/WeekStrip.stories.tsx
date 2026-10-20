import type { Meta, StoryObj } from '@storybook/react-native'

import type { WeekStripDay } from '@/entities/habit'

import { WeekStrip } from './WeekStrip'

const days: WeekStripDay[] = [
    { date: '2026-10-12', state: 'done' },
    { date: '2026-10-13', state: 'missed' },
    { date: '2026-10-14', state: 'done' },
    { date: '2026-10-15', state: 'not-due' },
    { date: '2026-10-16', state: 'done' },
    { date: '2026-10-17', state: 'future' },
    { date: '2026-10-18', state: 'future' },
]

const meta = {
    title: 'HabitsScreen/WeekStrip',
    component: WeekStrip,
    args: { days },
    argTypes: {
        days: { control: false },
    },
} satisfies Meta<typeof WeekStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
