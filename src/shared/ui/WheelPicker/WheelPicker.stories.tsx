import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { View } from 'react-native'

import { TheButton } from '@/shared/ui/TheButton'

import { WheelPicker } from './WheelPicker'

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => {
    const value = String(index + 1).padStart(2, '0')
    return { label: value, value }
})
const MONTH_OPTIONS = [
    'янв',
    'фев',
    'мар',
    'апр',
    'мая',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
].map((label, index) => ({ label, value: String(index + 1).padStart(2, '0') }))
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, index) => {
    const value = String(2024 + index)
    return { label: value, value }
})

function Example({ withReset }: { withReset: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [day, setDay] = useState('12')
    const [month, setMonth] = useState('10')
    const [year, setYear] = useState('2026')

    return (
        <View>
            <TheButton size="44" onPress={() => setIsOpen(true)}>
                {`${day}.${month}.${year}`}
            </TheButton>
            <WheelPicker
                isOpen={isOpen}
                title="Дата начала"
                setIsOpen={() => setIsOpen(false)}
                onSubmit={() => setIsOpen(false)}
                onReset={withReset ? () => setIsOpen(false) : undefined}
                columns={[
                    { options: DAY_OPTIONS, value: day, onChange: setDay },
                    {
                        options: MONTH_OPTIONS,
                        value: month,
                        onChange: setMonth,
                    },
                    {
                        options: YEAR_OPTIONS,
                        value: year,
                        onChange: setYear,
                        flex: 1.3,
                    },
                ]}
            />
        </View>
    )
}

const meta = {
    title: 'Shared/WheelPicker',
    component: WheelPicker,
    args: {
        isOpen: false,
        columns: [],
        setIsOpen: () => {},
        onSubmit: () => {},
    },
} satisfies Meta<typeof WheelPicker>

export default meta
type Story = StoryObj<typeof meta>

export const WithReset: Story = {
    name: 'Со сбросом',
    render: () => <Example withReset />,
}
export const WithoutReset: Story = {
    name: 'Без сброса',
    render: () => <Example withReset={false} />,
}
