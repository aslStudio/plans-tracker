import type { Meta, StoryObj } from '@storybook/react-native'

import { defaultTaskStatuses, type Task } from '@/shared/api'

import { TaskRow } from './TaskRow'

const task: Task = {
    id: 't1',
    title: 'Собрать чемодан',
    statusId: defaultTaskStatuses[0].id,
    startDate: '2026-10-14',
    endDate: '2026-10-14',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
}

const meta = {
    title: 'TasksScreen/TaskRow',
    component: TaskRow,
    args: {
        task,
        status: defaultTaskStatuses[0],
        isOverdue: false,
        dateLineText: '14 окт',
        priorityLabel: null,
        groupLabel: null,
        onPress: () => {},
        onAdvanceStatus: () => {},
    },
    argTypes: {
        task: { control: false },
        status: { control: false },
        priorityLabel: { control: false },
        groupLabel: { control: false },
        onPress: { control: false },
        onAdvanceStatus: { control: false },
    },
} satisfies Meta<typeof TaskRow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Overdue: Story = {
    name: 'Просрочена',
    args: { isOverdue: true },
}

export const Completed: Story = {
    name: 'Выполнена',
    args: { status: defaultTaskStatuses[defaultTaskStatuses.length - 1] },
}
