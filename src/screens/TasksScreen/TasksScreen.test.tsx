import { fireEvent } from '@testing-library/react-native'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
    DONE_STATUS_ID,
    defaultTaskStatuses,
    TODO_STATUS_ID,
} from '@/shared/api'
import type { Task } from '@/shared/api'
import { addDays, todayDateString } from '@/shared/lib/date'
import { render, screen, waitFor } from '@/shared/lib/test-utils'

import { TasksScreen } from './TasksScreen'

const now = new Date().toISOString()
const today = todayDateString()
const yesterday = addDays(today, -1)
const inFiveDays = addDays(today, 5)

const task = {
    id: '1',
    title: 'Собрать чемодан',
    statusId: TODO_STATUS_ID,
    priorityId: null,
    groupId: null,
    startDate: null,
    endDate: null,
    repeat: null,
    createdAt: now,
    updatedAt: now,
}

const noop = () => {}

function renderScreen(
    overrides: Partial<Parameters<typeof TasksScreen>[0]> = {},
) {
    return render(
        <TasksScreen
            tasks={[]}
            statuses={defaultTaskStatuses}
            groups={[]}
            priorities={[]}
            useGroups={false}
            usePriority={false}
            onAddTask={noop}
            onOpenTask={noop}
            onCompleteTask={noop}
            onDeleteTask={noop}
            onOpenCalendar={noop}
            onOpenSettings={noop}
            onActualizeTask={noop}
            onAdvanceStatus={noop}
            {...overrides}
        />,
    )
}

describe('TasksScreen', () => {
    it('renders the skeleton instead of the per-day placeholders while loading', () => {
        renderScreen({ isLoading: true })

        expect(screen.queryByText('Нет задач')).toBeNull()
        expect(screen.getByText('Задачи')).toBeTruthy()
    })

    it('renders the introduction only when the entire task collection is empty', () => {
        renderScreen()

        expect(screen.getByText('Начать')).toBeTruthy()
        expect(screen.queryByText('Нет задач')).toBeNull()
    })

    it('does not render the Просроченные/Бэклог sections when they are empty', () => {
        renderScreen()

        expect(screen.queryByText('Просроченные')).toBeNull()
        expect(screen.queryByText('Бэклог')).toBeNull()
    })

    it('keeps per-day placeholders when tasks exist elsewhere', () => {
        renderScreen({
            tasks: [{ ...task, startDate: inFiveDays, endDate: inFiveDays }],
        })
        expect(screen.queryByText('Начать')).toBeNull()
        expect(screen.getAllByText('Нет задач')).toHaveLength(2)
    })

    it('renders a task with no date under "Бэклог", not "Сегодня"', () => {
        renderScreen({ tasks: [task] })

        expect(screen.getByText('Бэклог')).toBeTruthy()
        expect(screen.getByText('Собрать чемодан')).toBeTruthy()
    })

    it('renders an overdue, uncompleted task under "Просроченные"', () => {
        const overdue = { ...task, startDate: yesterday, endDate: yesterday }
        renderScreen({ tasks: [overdue] })

        expect(screen.getByText('Просроченные')).toBeTruthy()
        expect(screen.getByText('Собрать чемодан')).toBeTruthy()
    })

    it('shows the overdue reminder when an overdue task is present', async () => {
        await AsyncStorage.removeItem(
            'plans-tracker.tasks-overdue-reminder-last-shown',
        )
        const overdue = { ...task, startDate: yesterday, endDate: yesterday }

        renderScreen({ tasks: [overdue] })

        await waitFor(() =>
            expect(screen.getByText('Есть просроченные задачи')).toBeTruthy(),
        )
        expect(screen.getByText('Понятно')).toBeTruthy()
    })

    it('celebrates after completing all today and overdue tasks', async () => {
        const overdueTask = {
            ...task,
            id: 'overdue',
            title: 'Просроченная задача',
            startDate: yesterday,
            endDate: yesterday,
            statusId: DONE_STATUS_ID,
        }
        const todayTask = {
            ...task,
            id: 'today',
            title: 'Задача на сегодня',
            startDate: today,
            endDate: today,
        }

        function InteractiveScreen() {
            const [items, setItems] = useState<Task[]>([overdueTask, todayTask])
            return (
                <TasksScreen
                    tasks={items}
                    statuses={defaultTaskStatuses}
                    groups={[]}
                    priorities={[]}
                    useGroups={false}
                    usePriority={false}
                    isLoading={false}
                    onAddTask={noop}
                    onOpenTask={noop}
                    onCompleteTask={noop}
                    onDeleteTask={noop}
                    onOpenCalendar={noop}
                    onOpenSettings={noop}
                    onActualizeTask={noop}
                    onAdvanceStatus={(taskId) =>
                        setItems((current) =>
                            current.map((item) =>
                                item.id === taskId
                                    ? { ...item, statusId: DONE_STATUS_ID }
                                    : item,
                            ),
                        )
                    }
                />
            )
        }

        render(<InteractiveScreen />)

        fireEvent.press(
            screen.getAllByRole('button', { name: 'Изменить статус' })[0],
        )

        await waitFor(() =>
            expect(screen.getByText('Все задачи выполнены!')).toBeTruthy(),
        )
        expect(screen.getByText(/включая просроченные/)).toBeTruthy()
        expect(screen.getByText('Отлично!')).toBeTruthy()
    })

    it('does not show a completed past task in current day cards', () => {
        const done = {
            ...task,
            startDate: yesterday,
            endDate: yesterday,
            statusId: DONE_STATUS_ID,
        }
        renderScreen({ tasks: [done] })

        expect(screen.queryByText('Просроченные')).toBeNull()
        expect(screen.queryByText('Собрать чемодан')).toBeNull()
    })

    it('does not place a plain one-day task due several days out anywhere', () => {
        const future = { ...task, startDate: inFiveDays, endDate: inFiveDays }
        renderScreen({ tasks: [future] })

        expect(screen.queryByText('Собрать чемодан')).toBeNull()
    })

    it('shows an explicitly ranged task in both "Сегодня" and "Завтра"', () => {
        const ranged = { ...task, startDate: today, endDate: inFiveDays }
        renderScreen({ tasks: [ranged] })

        expect(screen.getAllByText('Собрать чемодан')).toHaveLength(2)
        expect(
            screen.getAllByText(
                /окт|янв|фев|мар|апр|мая|июн|июл|авг|сен|ноя|дек/,
            ).length,
        ).toBeGreaterThan(0)
    })

    it('calls onOpenTask when a task row is pressed', () => {
        const onOpenTask = jest.fn()
        renderScreen({
            tasks: [{ ...task, startDate: today, endDate: today }],
            onOpenTask,
        })

        fireEvent.press(screen.getByText('Собрать чемодан'))

        expect(onOpenTask).toHaveBeenCalledWith('1')
    })

    it('calls onAddTask when the header add button is pressed', () => {
        const onAddTask = jest.fn()
        renderScreen({ onAddTask })

        fireEvent.press(screen.getByRole('button', { name: 'Добавить задачу' }))

        expect(onAddTask).toHaveBeenCalledTimes(1)
    })

    it('calls onAddTask from the introduction', () => {
        const onAddTask = jest.fn()
        renderScreen({ onAddTask })

        fireEvent.press(screen.getByRole('button', { name: 'Начать' }))

        expect(onAddTask).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenCalendar when the header "Все задачи" button is pressed', () => {
        const onOpenCalendar = jest.fn()
        renderScreen({ onOpenCalendar })

        fireEvent.press(screen.getAllByText('Все задачи')[0])

        expect(onOpenCalendar).toHaveBeenCalledTimes(1)
    })

    it('shows only the header "Все задачи" button when there are no tasks', () => {
        renderScreen()

        expect(screen.getAllByText('Все задачи')).toHaveLength(1)
        expect(screen.queryByText('Статистика недели')).toBeNull()
    })

    it('shows the task-completion chart instead of a second button once there is at least one task', () => {
        renderScreen({ tasks: [{ ...task, startDate: today, endDate: today }] })

        expect(screen.getAllByText('Все задачи')).toHaveLength(1)
        expect(screen.getByText('Статистика недели')).toBeTruthy()
    })

    it('renders a sort trigger for a non-empty day section', () => {
        renderScreen({ tasks: [{ ...task, startDate: today, endDate: today }] })

        expect(
            screen.getAllByRole('button', { name: 'Сортировка' }).length,
        ).toBeGreaterThan(0)
    })

    it('hides the filter button when groups are disabled', () => {
        renderScreen({ useGroups: false })

        expect(screen.queryByRole('button', { name: 'Фильтр' })).toBeNull()
    })

    it('shows the filter button when groups are enabled', () => {
        renderScreen({ useGroups: true, tasks: [task] })

        expect(
            screen.getAllByRole('button', { name: 'Фильтр' }).length,
        ).toBeGreaterThan(0)
    })

    it("replaces the description with the task's own group, colored by the group", () => {
        renderScreen({
            tasks: [
                {
                    ...task,
                    startDate: today,
                    endDate: today,
                    groupId: 'group-work',
                    description: 'ignored',
                },
            ],
            groups: [
                {
                    id: 'group-work',
                    label: 'Работа',
                    color: 'accent-blue',
                    order: 0,
                },
            ],
            useGroups: true,
        })

        expect(screen.getByText('Работа')).toBeTruthy()
        expect(screen.queryByText('ignored')).toBeNull()
    })

    it('shows "Другие" for an ungrouped task once groups are enabled', () => {
        renderScreen({
            tasks: [
                { ...task, startDate: today, endDate: today, groupId: null },
            ],
            groups: [
                {
                    id: 'group-work',
                    label: 'Работа',
                    color: 'accent-blue',
                    order: 0,
                },
            ],
            useGroups: true,
        })

        expect(screen.getByText('Другие')).toBeTruthy()
    })

    it('falls back to the plain description when groups are disabled', () => {
        renderScreen({
            tasks: [
                {
                    ...task,
                    startDate: today,
                    endDate: today,
                    description: 'A real description',
                },
            ],
            useGroups: false,
        })

        expect(screen.getByText('A real description')).toBeTruthy()
        expect(screen.queryByText('Другие')).toBeNull()
    })

    it('shows the priority between the date and the group, in its own color', () => {
        renderScreen({
            tasks: [
                {
                    ...task,
                    startDate: yesterday,
                    endDate: yesterday,
                    priorityId: 'priority-high',
                    groupId: 'group-work',
                },
            ],
            groups: [
                {
                    id: 'group-work',
                    label: 'Работа',
                    color: 'accent-blue',
                    order: 0,
                },
            ],
            priorities: [
                {
                    id: 'priority-high',
                    label: 'Высокий',
                    color: 'accent-red',
                    order: 2,
                    isBuiltIn: true,
                },
            ],
            useGroups: true,
            usePriority: true,
        })

        expect(screen.getByText('Высокий')).toBeTruthy()
        expect(screen.getByText('Работа')).toBeTruthy()
    })

    it('shows no priority segment at all for a task with none set — unlike groups, there is no fallback label', () => {
        renderScreen({
            tasks: [
                { ...task, startDate: today, endDate: today, priorityId: null },
            ],
            priorities: [
                {
                    id: 'priority-high',
                    label: 'Высокий',
                    color: 'accent-red',
                    order: 2,
                    isBuiltIn: true,
                },
            ],
            usePriority: true,
        })

        expect(screen.queryByText('Высокий')).toBeNull()
    })

    it('hides priority entirely when the setting is off, even if the task has one', () => {
        renderScreen({
            tasks: [
                {
                    ...task,
                    startDate: today,
                    endDate: today,
                    priorityId: 'priority-high',
                },
            ],
            priorities: [
                {
                    id: 'priority-high',
                    label: 'Высокий',
                    color: 'accent-red',
                    order: 2,
                    isBuiltIn: true,
                },
            ],
            usePriority: false,
        })

        expect(screen.queryByText('Высокий')).toBeNull()
    })

    it('renders both active and completed tasks for the same day', () => {
        const active = {
            ...task,
            id: 'active',
            title: 'Active task',
            statusId: TODO_STATUS_ID,
        }
        const done = {
            ...task,
            id: 'done',
            title: 'Done task',
            statusId: DONE_STATUS_ID,
        }

        renderScreen({ tasks: [done, active] })

        expect(screen.getByText('Active task')).toBeTruthy()
        expect(screen.getByText('Done task')).toBeTruthy()
    })
})
