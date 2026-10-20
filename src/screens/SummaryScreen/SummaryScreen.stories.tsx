import type { Meta, StoryObj } from '@storybook/react-native'

import { SummaryScreen } from './SummaryScreen'

const meta = {
    title: 'Screens/SummaryScreen',
    component: SummaryScreen,
    parameters: { noSafeArea: true },
    args: {
        isLoading: false,
        stats: [
            { id: 'tasks-today', label: 'Задачи сегодня', value: '2 / 5' },
            { id: 'habits-today', label: 'Привычки сегодня', value: '1 / 3' },
            { id: 'streak', label: 'Серия дней', value: '4' },
        ],
    },
} satisfies Meta<typeof SummaryScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
export const Empty: Story = { name: 'Пусто', args: { stats: [] } }
export const Loading: Story = {
    name: 'Загрузка',
    args: { stats: [], isLoading: true },
}
