import type { Meta, StoryObj } from '@storybook/react-native'
import { View } from 'react-native'

import { DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'

import { TaskRadio } from './TaskRadio'

const meta = {
    title: 'Screens/TasksScreen/TaskRadio',
    component: TaskRadio,
    decorators: [
        (Story) => (
            <View style={{ padding: 20 }}>
                <Story />
            </View>
        ),
    ],
    args: {
        status: {
            id: TODO_STATUS_ID,
            label: 'К выполнению',
            order: 0,
            isCompleted: false,
            isBuiltIn: true,
        },
        isOverdue: false,
        size: 24,
    },
} satisfies Meta<typeof TaskRadio>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const AllStates: Story = {
    name: 'Все состояния',
    render: () => (
        <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
            <TaskRadio
                status={{
                    id: TODO_STATUS_ID,
                    label: 'К выполнению',
                    order: 0,
                    isCompleted: false,
                    isBuiltIn: true,
                }}
                isOverdue={false}
            />
            <TaskRadio
                status={{
                    id: 'custom-blocked',
                    label: 'Блокировано',
                    color: 'accent-orange',
                    order: 1,
                    isCompleted: false,
                    isBuiltIn: false,
                }}
                isOverdue={false}
            />
            <TaskRadio
                status={{
                    id: DONE_STATUS_ID,
                    label: 'Готово',
                    color: 'accent-green',
                    order: 2,
                    isCompleted: true,
                    isBuiltIn: true,
                }}
                isOverdue={false}
            />
            <TaskRadio
                status={{
                    id: TODO_STATUS_ID,
                    label: 'К выполнению',
                    order: 0,
                    isCompleted: false,
                    isBuiltIn: true,
                }}
                isOverdue
            />
        </View>
    ),
}
