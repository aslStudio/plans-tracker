import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { fn } from 'storybook/test'

import {
    defaultTaskPriorities,
    defaultTaskStatuses,
    TODO_STATUS_ID,
} from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'

import { createEmptyDraft, type TaskDraft } from './lib/draft'
import { TaskDetailsScreen } from './TaskDetailsScreen'
import type { TaskDetailsScreenProps } from './model'

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

const EDITING_DRAFT: TaskDraft = {
    title: 'Собрать чемодан перед поездкой в аэропорт',
    description: '<p>Паспорт, зарядка, наличные — проверить ещё раз всё</p>',
    statusId: TODO_STATUS_ID,
    groupId: 'group-work',
    priorityId: defaultTaskPriorities[2].id,
    startDate: todayDateString(),
    endDate: todayDateString(),
    repeat: null,
}

/**
 * A static `args.draft` would just sit there — typing the title, picking a
 * status, tapping a color swatch all call `onChange`, which does nothing
 * unless something feeds the patch back in. This mirrors what the real
 * `task/[id]` route does: keep the draft in local state, merge every patch
 * into it, hand the merged value back down.
 */
function Example({
    initialDraft,
    ...props
}: Omit<TaskDetailsScreenProps, 'draft' | 'onChange'> & {
    initialDraft: TaskDraft
}) {
    const [draft, setDraft] = useState(initialDraft)

    return (
        <TaskDetailsScreen
            {...props}
            draft={draft}
            onChange={(patch) =>
                setDraft((current) => ({ ...current, ...patch }))
            }
        />
    )
}

const meta = {
    title: 'Screens/TaskDetailsScreen',
    component: TaskDetailsScreen,
    parameters: { noSafeArea: true },
    args: {
        statuses: defaultTaskStatuses,
        groups: GROUPS,
        priorities: defaultTaskPriorities,
        useGroups: true,
        usePriority: true,
        isNew: false,
        onChange: fn(),
        onDelete: fn(),
        onClose: fn(),
        onSave: fn(),
        draft: EDITING_DRAFT,
    },
    argTypes: {
        draft: { control: false },
        onChange: { control: false },
    },
} satisfies Meta<typeof TaskDetailsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Editing: Story = {
    name: 'Редактирование',
    render: (args) => <Example {...args} initialDraft={EDITING_DRAFT} />,
}
export const Creating: Story = {
    name: 'Создание',
    args: { isNew: true, onDelete: undefined },
    render: (args) => <Example {...args} initialDraft={createEmptyDraft()} />,
}
export const WithoutGroupsOrPriority: Story = {
    name: 'Без групп и приоритета',
    args: { useGroups: false, usePriority: false },
    render: (args) => <Example {...args} initialDraft={EDITING_DRAFT} />,
}
