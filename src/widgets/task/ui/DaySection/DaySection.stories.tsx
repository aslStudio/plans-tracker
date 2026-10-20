import type { Meta, StoryObj } from '@storybook/react-native'

import { defaultTaskStatuses } from '@/shared/api'

import type { TaskOccurrence } from '@/entities/task'
import { DaySection } from './DaySection'

const task: TaskOccurrence = {
    id: '1',
    title: 'Собрать чемодан',
    statusId: defaultTaskStatuses[0].id,
    startDate: '2026-10-14',
    endDate: '2026-10-14',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
}

const meta = {
    title: 'TasksScreen/DaySection',
    component: DaySection,
    args: {
        sectionKey: 'today',
        title: 'Сегодня',
        tasks: [task],
        dayDate: '2026-10-14',
        statuses: defaultTaskStatuses,
        groups: [],
        priorities: [],
        useGroups: false,
        usePriority: false,
        today: '2026-10-14',
        alwaysShow: true,
        onOpenTask: () => {},
        onCompleteTask: () => {},
        onDeleteTask: () => {},
        onAddTask: () => {},
        onActualizeTask: () => {},
        onAdvanceStatus: () => {},
    },
    argTypes: {
        tasks: { control: false },
        statuses: { control: false },
        groups: { control: false },
        priorities: { control: false },
        onOpenTask: { control: false },
        onCompleteTask: { control: false },
        onDeleteTask: { control: false },
        onAddTask: { control: false },
        onActualizeTask: { control: false },
        onAdvanceStatus: { control: false },
    },
} satisfies Meta<typeof DaySection>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Empty: Story = {
    name: 'Нет задач',
    args: { tasks: [] },
}
