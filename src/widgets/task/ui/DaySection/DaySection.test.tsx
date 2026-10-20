import { fireEvent } from '@testing-library/react-native'

import { TODO_STATUS_ID, defaultTaskStatuses } from '@/shared/api'
import { render, screen } from '@/shared/lib/test-utils'

import { DaySection } from './DaySection'

const now = new Date().toISOString()

const overdueTask = {
    id: '1',
    title: 'Собрать чемодан',
    statusId: TODO_STATUS_ID,
    startDate: '2026-10-01',
    endDate: '2026-10-01',
    createdAt: now,
    updatedAt: now,
}

const noop = () => {}

function renderSection(
    overrides: Partial<Parameters<typeof DaySection>[0]> = {},
) {
    return render(
        <DaySection
            sectionKey="test"
            title="День"
            tasks={[overdueTask]}
            dayDate="2026-10-01"
            statuses={defaultTaskStatuses}
            groups={[]}
            priorities={[]}
            useGroups={false}
            usePriority={false}
            today="2026-10-12"
            alwaysShow
            onOpenTask={noop}
            onCompleteTask={noop}
            onDeleteTask={noop}
            onAddTask={noop}
            onActualizeTask={noop}
            onAdvanceStatus={noop}
            {...overrides}
        />,
    )
}

describe('DaySection', () => {
    it('centers the add action in an empty day', () => {
        renderSection({ tasks: [] })

        expect(screen.getByTestId('empty-day-action')).toHaveStyle({
            width: '100%',
            justifyContent: 'center',
        })
        expect(screen.getByRole('button', { name: 'Добавить' })).toHaveStyle({
            width: 'auto',
        })
    })

    it('shows editing without actualizing for an overdue task', () => {
        renderSection({ today: '2026-10-12' })

        expect(screen.queryByRole('button', { name: 'Обновить' })).toBeNull()
        expect(screen.getByRole('button', { name: 'Изменить' })).toBeTruthy()
    })

    it('shows "Изменить" (not "Обновить") for a task that is not overdue', () => {
        const dueToday = {
            ...overdueTask,
            startDate: '2026-10-12',
            endDate: '2026-10-12',
        }
        renderSection({ tasks: [dueToday], today: '2026-10-12' })

        expect(screen.getByRole('button', { name: 'Изменить' })).toBeTruthy()
        expect(screen.queryByRole('button', { name: 'Обновить' })).toBeNull()
    })

    it('calls onOpenTask when "Изменить" is pressed', () => {
        const onOpenTask = jest.fn()
        const dueToday = {
            ...overdueTask,
            startDate: '2026-10-12',
            endDate: '2026-10-12',
        }
        renderSection({ tasks: [dueToday], today: '2026-10-12', onOpenTask })

        fireEvent.press(screen.getByRole('button', { name: 'Изменить' }))

        expect(onOpenTask).toHaveBeenCalledWith('1')
    })

    it('opens an overdue task from its edit action', () => {
        const onOpenTask = jest.fn()
        renderSection({ onOpenTask })
        fireEvent.press(screen.getByRole('button', { name: 'Изменить' }))
        expect(onOpenTask).toHaveBeenCalledWith('1')
    })

    it('calls onAdvanceStatus with the task id when the status circle is pressed', () => {
        const onAdvanceStatus = jest.fn()
        renderSection({ onAdvanceStatus })

        fireEvent.press(screen.getByRole('button', { name: 'Изменить статус' }))

        expect(onAdvanceStatus).toHaveBeenCalledWith('1')
    })
})

it('passes the opened repeat date when editing a recurring task', () => {
    const onOpenTask = jest.fn()
    renderSection({
        tasks: [
            {
                ...overdueTask,
                repeat: { type: 'daily' },
                occurrenceDate: '2026-10-16',
            },
        ],
        dayDate: '2026-10-16',
        onOpenTask,
    })
    fireEvent.press(screen.getByRole('button', { name: 'Изменить' }))
    expect(onOpenTask).toHaveBeenCalledWith('1', '2026-10-16')
})
