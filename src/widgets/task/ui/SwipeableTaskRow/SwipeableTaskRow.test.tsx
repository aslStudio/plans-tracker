import { Text } from 'react-native'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { SwipeableTaskRow } from './SwipeableTaskRow'

describe('SwipeableTaskRow', () => {
    it('renders its children', () => {
        render(
            <SwipeableTaskRow
                taskId="t1"
                isCompleted={false}
                onComplete={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
            >
                <Text>Собрать чемодан</Text>
            </SwipeableTaskRow>,
        )

        expect(screen.getByText('Собрать чемодан')).toBeTruthy()
    })

    it('calls onComplete when "Готово" is pressed', () => {
        const onComplete = jest.fn()
        render(
            <SwipeableTaskRow
                taskId="t1"
                isCompleted={false}
                onComplete={onComplete}
                onDelete={() => {}}
                onEdit={() => {}}
            >
                <Text>Собрать чемодан</Text>
            </SwipeableTaskRow>,
        )

        fireEvent.press(screen.getByLabelText('Отметить выполненной'))

        expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete again once already completed', () => {
        const onComplete = jest.fn()
        render(
            <SwipeableTaskRow
                taskId="t1"
                isCompleted
                onComplete={onComplete}
                onDelete={() => {}}
                onEdit={() => {}}
            >
                <Text>Собрать чемодан</Text>
            </SwipeableTaskRow>,
        )

        expect(screen.queryByLabelText('Отметить выполненной')).toBeNull()
    })

    it.each([false, true])(
        'calls onEdit for completed=%s when "Изменить" is pressed',
        (isCompleted) => {
            const onEdit = jest.fn()
            render(
                <SwipeableTaskRow
                    taskId="t1"
                    isCompleted={isCompleted}
                    onComplete={() => {}}
                    onDelete={() => {}}
                    onEdit={onEdit}
                >
                    <Text>Собрать чемодан</Text>
                </SwipeableTaskRow>,
            )

            fireEvent.press(screen.getByLabelText('Изменить'))

            expect(onEdit).toHaveBeenCalledTimes(1)
        },
    )

    it('asks for confirmation and calls onDelete once confirmed', () => {
        const onDelete = jest.fn()
        render(
            <SwipeableTaskRow
                taskId="t1"
                isCompleted={false}
                onComplete={() => {}}
                onDelete={onDelete}
                onEdit={() => {}}
            >
                <Text>Собрать чемодан</Text>
            </SwipeableTaskRow>,
        )

        fireEvent.press(screen.getByLabelText('Удалить задачу'))
        expect(onDelete).not.toHaveBeenCalled()

        const confirmButton = screen.getAllByText('Удалить').at(-1)
        fireEvent.press(confirmButton!)

        expect(onDelete).toHaveBeenCalledTimes(1)
    })
})
