import type { Meta, StoryObj } from '@storybook/react-native'
import { fn } from 'storybook/test'

import {
    defaultTaskPriorities,
    defaultTaskStatuses,
    DONE_STATUS_ID,
    TODO_STATUS_ID,
} from '@/shared/api'
import { addDays, todayDateString } from '@/shared/lib/date'

import { TasksScreen } from './TasksScreen'

const now = new Date().toISOString()
const today = todayDateString()
const tomorrow = addDays(today, 1)
const yesterday = addDays(today, -1)
const inFiveDays = addDays(today, 5)

const [LOW_PRIORITY, MEDIUM_PRIORITY, HIGH_PRIORITY] = defaultTaskPriorities

const CUSTOM_STATUS = {
    id: 'status-blocked',
    label: 'Блокировано',
    color: 'accent-orange' as const,
    order: 2,
    isCompleted: false,
    isBuiltIn: false,
}

const GROUPS = [
    {
        id: 'group-work',
        label: 'Работа',
        color: 'accent-blue' as const,
        order: 0,
    },
    {
        id: 'group-home',
        label: 'Дом',
        color: 'accent-green' as const,
        order: 1,
    },
]

const meta = {
    title: 'Screens/TasksScreen',
    component: TasksScreen,
    parameters: { noSafeArea: true },
    args: {
        statuses: [...defaultTaskStatuses, CUSTOM_STATUS],
        groups: GROUPS,
        priorities: defaultTaskPriorities,
        useGroups: true,
        usePriority: true,
        isLoading: false,
        onAddTask: fn(),
        onOpenTask: fn(),
        onCompleteTask: fn(),
        onDeleteTask: fn(),
        onOpenCalendar: fn(),
        onOpenSettings: fn(),
        onActualizeTask: fn(),
        onAdvanceStatus: fn(),
        tasks: [
            {
                id: '1',
                title: 'Собрать чемодан перед поездкой в аэропорт',
                description:
                    'Паспорт, зарядка, наличные — проверить ещё раз всё',
                statusId: TODO_STATUS_ID,
                priorityId: HIGH_PRIORITY.id,
                groupId: null,
                startDate: today,
                endDate: today,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '2',
                title: 'Созвон с командой',
                statusId: CUSTOM_STATUS.id,
                priorityId: MEDIUM_PRIORITY.id,
                groupId: 'group-work',
                startDate: today,
                endDate: today,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '3',
                title: 'Оплатить интернет',
                statusId: DONE_STATUS_ID,
                priorityId: null,
                groupId: 'group-home',
                startDate: today,
                endDate: today,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '4',
                title: 'Вынести мусор',
                statusId: TODO_STATUS_ID,
                priorityId: LOW_PRIORITY.id,
                groupId: null,
                startDate: yesterday,
                endDate: yesterday,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '5',
                title: 'Забрать посылку с почты',
                statusId: TODO_STATUS_ID,
                priorityId: null,
                groupId: 'group-home',
                startDate: tomorrow,
                endDate: tomorrow,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '6',
                title: 'Подготовить презентацию к конференции',
                statusId: TODO_STATUS_ID,
                priorityId: HIGH_PRIORITY.id,
                groupId: 'group-work',
                // An explicit range (расширенная сущность) — spans through
                // both shown day cards, unlike a plain one-day task.
                startDate: today,
                endDate: inFiveDays,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: '7',
                title: 'Прочитать книгу',
                statusId: TODO_STATUS_ID,
                priorityId: null,
                groupId: null,
                startDate: null,
                endDate: null,
                repeat: null,
                createdAt: now,
                updatedAt: now,
            },
        ],
    },
} satisfies Meta<typeof TasksScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }
export const WithoutGroups: Story = {
    name: 'Без групп',
    args: { useGroups: false },
}
export const WithoutPriority: Story = {
    name: 'Без приоритета',
    args: { usePriority: false },
}
export const Empty: Story = { name: 'Пусто', args: { tasks: [] } }
export const Loading: Story = {
    name: 'Загрузка',
    args: { tasks: [], isLoading: true },
}
