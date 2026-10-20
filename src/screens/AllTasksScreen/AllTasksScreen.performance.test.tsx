import { fireEvent, waitFor } from '@testing-library/react-native'
import { render, screen } from '@/shared/lib/test-utils'
import { defaultTaskStatuses, TODO_STATUS_ID } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'
import { TaskRow } from '@/widgets/task/ui/TaskRow'
import { AllTasksScreen } from './AllTasksScreen'

jest.mock('@/widgets/task/ui/TaskRow', () => ({ TaskRow: jest.fn(() => null) }))

it('does not render mounted task rows again across several pages', async () => {
    const today = todayDateString()
    const noop = () => {}
    render(
        <AllTasksScreen
            tasks={[
                {
                    id: 'daily',
                    title: 'Daily',
                    statusId: TODO_STATUS_ID,
                    startDate: today,
                    repeat: { type: 'daily' },
                    createdAt: today,
                    updatedAt: today,
                },
            ]}
            statuses={defaultTaskStatuses}
            groups={[]}
            priorities={[]}
            useGroups={false}
            usePriority={false}
            onClose={noop}
            onAddTask={noop}
            onOpenTask={noop}
            onCompleteTask={noop}
            onDeleteTask={noop}
            onActualizeTask={noop}
            onAdvanceStatus={noop}
        />,
    )
    const list = screen.getByTestId('all-tasks-list')
    fireEvent(list, 'endReached')
    await waitFor(() =>
        expect(screen.getByTestId('all-tasks-list').props.data.length).toBe(42),
    )
    for (const expectedCount of [62, 82, 102]) {
        fireEvent(screen.getByTestId('all-tasks-list'), 'endReached')
        await waitFor(() =>
            expect(screen.getByTestId('all-tasks-list').props.data.length).toBe(
                expectedCount,
            ),
        )
    }
    const todayRenders = jest
        .mocked(TaskRow)
        .mock.calls.filter(
            ([props]) =>
                'occurrenceDate' in props.task &&
                props.task.occurrenceDate === today,
        )
    expect(todayRenders).toHaveLength(1)
})

it('mounts only a small batch when one day contains hundreds of tasks', () => {
    jest.mocked(TaskRow).mockClear()
    const today = todayDateString()
    const noop = () => {}
    render(
        <AllTasksScreen
            tasks={Array.from({ length: 300 }, (_, i) => ({
                id: String(i),
                title: `Task ${i}`,
                statusId: TODO_STATUS_ID,
                startDate: today,
                endDate: today,
                createdAt: today,
                updatedAt: today,
            }))}
            statuses={defaultTaskStatuses}
            groups={[]}
            priorities={[]}
            useGroups={false}
            usePriority={false}
            onClose={noop}
            onAddTask={noop}
            onOpenTask={noop}
            onCompleteTask={noop}
            onDeleteTask={noop}
            onActualizeTask={noop}
            onAdvanceStatus={noop}
        />,
    )
    expect(jest.mocked(TaskRow).mock.calls.length).toBeGreaterThan(0)
    expect(jest.mocked(TaskRow).mock.calls.length).toBeLessThan(20)
    expect(
        screen
            .getByTestId('all-tasks-list')
            .props.data.filter(
                (cell: { type: string }) => cell.type === 'task',
            ),
    ).toHaveLength(300)
})
