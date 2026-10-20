import { fireEvent, render } from '@/shared/lib/test-utils'

import { DeleteConfirmationSheet } from './DeleteConfirmationSheet'

describe('DeleteConfirmationSheet', () => {
    it('renders the default title and confirm label', () => {
        const { getByText } = render(
            <DeleteConfirmationSheet
                visible
                onCancel={() => {}}
                onConfirm={() => {}}
            />,
        )

        expect(
            getByText('Удалить без возможности восстановления?'),
        ).toBeTruthy()
        expect(getByText('Удалить')).toBeTruthy()
    })

    it('renders a custom title, description and confirm label', () => {
        const { getByText } = render(
            <DeleteConfirmationSheet
                visible
                title="Очистить всё?"
                description="Действие нельзя отменить"
                confirmLabel="Очистить"
                onCancel={() => {}}
                onConfirm={() => {}}
            />,
        )

        expect(getByText('Очистить всё?')).toBeTruthy()
        expect(getByText('Действие нельзя отменить')).toBeTruthy()
        expect(getByText('Очистить')).toBeTruthy()
    })

    it('calls onConfirm when the confirm button is pressed', () => {
        const onConfirm = jest.fn()
        const { getByText } = render(
            <DeleteConfirmationSheet
                visible
                onCancel={() => {}}
                onConfirm={onConfirm}
            />,
        )

        fireEvent.press(getByText('Удалить'))

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when the cancel button is pressed', () => {
        const onCancel = jest.fn()
        const { getByText } = render(
            <DeleteConfirmationSheet
                visible
                onCancel={onCancel}
                onConfirm={() => {}}
            />,
        )

        fireEvent.press(getByText('Отмена'))

        expect(onCancel).toHaveBeenCalledTimes(1)
    })
})
