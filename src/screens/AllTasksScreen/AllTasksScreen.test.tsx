import { fireEvent, waitFor } from '@testing-library/react-native'

import { TODO_STATUS_ID, defaultTaskStatuses } from '@/shared/api'
import { addDays, todayDateString } from '@/shared/lib/date'
import { render, screen } from '@/shared/lib/test-utils'

import { AllTasksScreen } from './AllTasksScreen'

const today = todayDateString()
const now = new Date().toISOString()

function task(
    id: string,
    date: string,
    overrides: Record<string, unknown> = {},
) {
    return {
        id,
        title: `Задача ${id}`,
        statusId: TODO_STATUS_ID,
        startDate: date,
        endDate: date,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    }
}

const noop = () => {}

function renderScreen(
    overrides: Partial<Parameters<typeof AllTasksScreen>[0]> = {},
) {
    return render(
        <AllTasksScreen
            tasks={[]}
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
            {...overrides}
        />,
    )
}

describe('AllTasksScreen', () => {
    it('shows the Сегодня section even with nothing due today', () => {
        renderScreen()

        expect(screen.getByText('Сегодня')).toBeTruthy()
        // Today and the trailing buffer day are both empty here.
        expect(screen.getAllByText('Нет задач')).toHaveLength(2)
    })

    it('calls onClose when the close button is pressed', () => {
        const onClose = jest.fn()
        renderScreen({ onClose })

        fireEvent.press(screen.getByRole('button', { name: 'Закрыть' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('skips empty days and shows a future day with a task, plus one trailing empty day', () => {
        const future = addDays(today, 5)
        renderScreen({ tasks: [task('a', future)] })

        expect(screen.getByText('Задача a')).toBeTruthy()
        // The day right after the last populated one is still rendered, empty.
        expect(screen.getAllByText('Нет задач')).toHaveLength(2)
    })

    it('opens a task when its row is pressed', () => {
        const onOpenTask = jest.fn()
        renderScreen({ tasks: [task('a', today)], onOpenTask })

        fireEvent.press(screen.getByText('Задача a'))

        expect(onOpenTask).toHaveBeenCalledWith('a')
    })

    it('calls onDeleteTask via the swipe delete action', () => {
        const onDeleteTask = jest.fn()
        renderScreen({ tasks: [task('a', today)], onDeleteTask })

        fireEvent.press(screen.getByLabelText('Удалить задачу'))
        fireEvent.press(screen.getAllByText('Удалить').at(-1)!)

        expect(onDeleteTask).toHaveBeenCalledWith('a')
    })

    it('calls onAdvanceStatus with the task id when its status circle is pressed', () => {
        const onAdvanceStatus = jest.fn()
        renderScreen({ tasks: [task('a', today)], onAdvanceStatus })

        fireEvent.press(screen.getByRole('button', { name: 'Изменить статус' }))

        expect(onAdvanceStatus).toHaveBeenCalledWith('a')
    })

    it("calls onAddTask with that day's date from its empty-state add button", () => {
        const onAddTask = jest.fn()
        renderScreen({ onAddTask })

        // Today's section renders first — the buffer day right after it is
        // the other "Добавить" button on an empty backlog.
        fireEvent.press(screen.getAllByRole('button', { name: 'Добавить' })[0])

        expect(onAddTask).toHaveBeenCalledWith(today)
    })

    it('reveals a past day with a task once scrolled to the top', async () => {
        const past = addDays(today, -5)
        renderScreen({ tasks: [task('old', past)] })

        expect(screen.queryByText('Задача old')).toBeNull()

        fireEvent(screen.getByTestId('all-tasks-list'), 'scrollBeginDrag')
        fireEvent(screen.getByTestId('all-tasks-list'), 'startReached')

        await waitFor(() => expect(screen.getByText('Задача old')).toBeTruthy())
    })

    it('only scans a small forward window up front, growing it as the list is scrolled to its end', async () => {
        const farFuture = addDays(today, 15)
        renderScreen({ tasks: [task('a', farFuture)] })

        expect(screen.queryByText('Задача a')).toBeNull()

        fireEvent(screen.getByTestId('all-tasks-list'), 'endReached')

        expect(screen.getByTestId('agenda-day-skeleton')).toBeTruthy()
        await waitFor(() => expect(screen.getByText('Задача a')).toBeTruthy())
    })

    it('never surfaces a day further back than a year with no task history', () => {
        renderScreen()
        const list = screen.getByTestId('all-tasks-list')

        for (let i = 0; i < 20; i++) fireEvent(list, 'startReached')

        // Nothing to assert on content (there's no task data at all) — this
        // just proves repeated scrolling terminates instead of looping.
        expect(screen.getByText('Сегодня')).toBeTruthy()
    })
})

it('shows skeleton cards instead of empty days while initially loading', () => {
    renderScreen({ isLoading: true })
    expect(screen.getByTestId('all-tasks-loading')).toBeTruthy()
    expect(screen.getAllByTestId('agenda-day-skeleton')).toHaveLength(3)
    expect(screen.queryByText('Нет задач')).toBeNull()
})

it('does not prepend history automatically before the user starts scrolling', () => {
    renderScreen({ tasks: [task('old', addDays(today, -5))] })
    fireEvent(screen.getByTestId('all-tasks-list'), 'startReached')
    expect(screen.queryByText('Задача old')).toBeNull()
    expect(screen.queryByTestId('agenda-day-skeleton')).toBeNull()
})

it('continues paging across empty chunks to the next populated day', async () => {
    renderScreen({ tasks: [task('far', addDays(today, 45))] })
    fireEvent(screen.getByTestId('all-tasks-list'), 'endReached')
    fireEvent(screen.getByTestId('all-tasks-list'), 'endReached')
    expect(screen.getAllByText('Нет задач')).toHaveLength(1)
    await waitFor(() => expect(screen.getByText('Задача far')).toBeTruthy())
    expect(screen.queryByTestId('agenda-day-skeleton')).toBeNull()
})
