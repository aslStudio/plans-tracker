import { fireEvent } from '@testing-library/react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { EntityEditorSheet } from './EntityEditorSheet'

const noop = () => {}

describe('EntityEditorSheet', () => {
    it('shows the title and the initial label', () => {
        render(
            <EntityEditorSheet
                title="Группа"
                allowNoColor={false}
                initialValue={{ label: 'Работа', color: 'accent-blue' }}
                onClose={noop}
                onSubmit={noop}
            />,
        )

        expect(screen.getByText('Группа')).toBeTruthy()
        expect(screen.getByDisplayValue('Работа')).toBeTruthy()
    })

    it('disables "Сохранить" when the label is blank', () => {
        render(
            <EntityEditorSheet
                title="Новая группа"
                allowNoColor={false}
                initialValue={{ label: '', color: 'accent-blue' }}
                onClose={noop}
                onSubmit={noop}
            />,
        )

        expect(screen.getByText('Сохранить').props.disabled).not.toBe(false)
    })

    it('calls onSubmit with the trimmed label and chosen color', () => {
        const onSubmit = jest.fn()
        render(
            <EntityEditorSheet
                title="Группа"
                allowNoColor={false}
                initialValue={{ label: 'Работа', color: 'accent-blue' }}
                onClose={noop}
                onSubmit={onSubmit}
            />,
        )

        fireEvent.changeText(screen.getByDisplayValue('Работа'), '  Дом  ')
        fireEvent.press(screen.getByLabelText('accent-red'))
        fireEvent.press(screen.getByText('Сохранить'))

        expect(onSubmit).toHaveBeenCalledWith({
            label: 'Дом',
            color: 'accent-red',
        })
    })

    it('does not show "Удалить" while creating (no onDelete)', () => {
        render(
            <EntityEditorSheet
                title="Новая группа"
                allowNoColor={false}
                initialValue={{ label: '', color: 'accent-blue' }}
                onClose={noop}
                onSubmit={noop}
            />,
        )

        expect(screen.queryByText('Удалить')).toBeNull()
    })

    it('calls onDelete when "Удалить" is pressed', () => {
        const onDelete = jest.fn()
        render(
            <EntityEditorSheet
                title="Группа"
                allowNoColor={false}
                initialValue={{ label: 'Работа', color: 'accent-blue' }}
                onClose={noop}
                onSubmit={noop}
                onDelete={onDelete}
            />,
        )

        fireEvent.press(screen.getByText('Удалить'))
        expect(onDelete).not.toHaveBeenCalled()
        // The first press swaps the sheet's own content to the delete
        // confirmation instead of opening a second modal on top — so the
        // confirm button reuses the same "Удалить" label, now alone.
        fireEvent.press(screen.getByText('Удалить'))

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the header close button is pressed', () => {
        const onClose = jest.fn()
        render(
            <EntityEditorSheet
                title="Группа"
                allowNoColor={false}
                initialValue={{ label: 'Работа', color: 'accent-blue' }}
                onClose={onClose}
                onSubmit={noop}
            />,
        )

        fireEvent.press(screen.getByRole('button', { name: 'Закрыть' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
