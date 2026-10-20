import { defaultTaskStatuses, type Task } from '@/shared/api'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { TaskRow } from './TaskRow'

const task: Task = {
    id: 't1',
    title: 'Собрать чемодан',
    statusId: defaultTaskStatuses[0].id,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
}

describe('TaskRow', () => {
    it('renders the task title and date line', () => {
        render(
            <TaskRow
                task={task}
                status={defaultTaskStatuses[0]}
                isOverdue={false}
                dateLineText="14 окт"
                priorityLabel={null}
                groupLabel={null}
                onPress={() => {}}
                onAdvanceStatus={() => {}}
            />,
        )

        expect(screen.getByText('Собрать чемодан')).toBeTruthy()
        expect(screen.getByText('14 окт')).toBeTruthy()
    })

    it('calls onPress when the content area is pressed', () => {
        const onPress = jest.fn()
        render(
            <TaskRow
                task={task}
                status={defaultTaskStatuses[0]}
                isOverdue={false}
                dateLineText={null}
                priorityLabel={null}
                groupLabel={null}
                onPress={onPress}
                onAdvanceStatus={() => {}}
            />,
        )

        fireEvent.press(screen.getByText('Собрать чемодан'))

        expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('calls onAdvanceStatus when the status radio is pressed', () => {
        const onAdvanceStatus = jest.fn()
        render(
            <TaskRow
                task={task}
                status={defaultTaskStatuses[0]}
                isOverdue={false}
                dateLineText={null}
                priorityLabel={null}
                groupLabel={null}
                onPress={() => {}}
                onAdvanceStatus={onAdvanceStatus}
            />,
        )

        fireEvent.press(screen.getByLabelText('Изменить статус'))

        expect(onAdvanceStatus).toHaveBeenCalledTimes(1)
    })
})
