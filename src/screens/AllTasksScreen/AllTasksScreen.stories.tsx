import type { Meta, StoryObj } from '@storybook/react-native'
import { fn } from 'storybook/test'

import {
    defaultTaskPriorities,
    defaultTaskStatuses,
    DONE_STATUS_ID,
    TODO_STATUS_ID,
} from '@/shared/api'
import { addDays, todayDateString } from '@/shared/lib/date'

import { AllTasksScreen } from './AllTasksScreen'

const now = new Date().toISOString()
const today = todayDateString()

const meta = {
    title: 'Screens/AllTasksScreen',
    component: AllTasksScreen,
    parameters: { noSafeArea: true },
    args: {
        statuses: defaultTaskStatuses,
        groups: [
            {
                id: 'group-work',
                label: 'Работа',
                color: 'accent-blue' as const,
                order: 0,
            },
        ],
        priorities: defaultTaskPriorities,
        useGroups: true,
        usePriority: true,
        onClose: fn(),
        onAddTask: fn(),
        onOpenTask: fn(),
        onCompleteTask: fn(),
        onDeleteTask: fn(),
        onActualizeTask: fn(),
        onAdvanceStatus: fn(),
        tasks: [
            {
                id: '1',
                title: 'Собрать чемодан',
                statusId: TODO_STATUS_ID,
                groupId: 'group-work',
                startDate: today,
                endDate: today,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '2',
                title: 'Оплатить интернет',
                statusId: DONE_STATUS_ID,
                startDate: addDays(today, -3),
                endDate: addDays(today, -3),
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '3',
                title: 'Забронировать отель',
                statusId: TODO_STATUS_ID,
                startDate: addDays(today, 5),
                endDate: addDays(today, 5),
                createdAt: now,
                updatedAt: now,
            },
        ],
    },
} satisfies Meta<typeof AllTasksScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Filled: Story = { name: 'С задачами' }
export const Empty: Story = { name: 'Пусто', args: { tasks: [] } }
