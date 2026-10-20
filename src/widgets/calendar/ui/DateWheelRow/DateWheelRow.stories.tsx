import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'

import { Section } from '@/shared/ui/Section'
import { todayDateString } from '@/shared/lib/date'

import { DateWheelRow } from './DateWheelRow'

function Example({ initialValue }: { initialValue: string | null }) {
    const [value, setValue] = useState(initialValue)

    return (
        <Section>
            <DateWheelRow
                label="Дата начала"
                value={value}
                onChange={setValue}
            />
        </Section>
    )
}

const meta = {
    title: 'Screens/TaskDetailsScreen/DateWheelRow',
    component: DateWheelRow,
    args: { label: 'Дата начала', value: null, onChange: () => {} },
    argTypes: { value: { control: false }, onChange: { control: false } },
} satisfies Meta<typeof DateWheelRow>

export default meta
type Story = StoryObj<typeof meta>

export const NotSet: Story = {
    name: 'Не задана',
    render: () => <Example initialValue={null} />,
}
export const Set: Story = {
    name: 'Задана',
    render: () => <Example initialValue={todayDateString()} />,
}
