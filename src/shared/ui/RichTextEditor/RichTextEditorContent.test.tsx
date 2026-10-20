import { fireEvent, screen } from '@testing-library/react-native'

import { render } from '@/shared/lib/test-utils'

import { RichTextEditorContent } from './RichTextEditorContent'
import { useRichTextEditor } from './useRichTextEditor'

function Harness({
    initialContent,
    onChange = () => {},
}: {
    initialContent: string
    onChange?: (html: string) => void
}) {
    const controller = useRichTextEditor({
        initialContent,
        placeholder: 'Описание',
        onChange,
    })
    return <RichTextEditorContent controller={controller} />
}

describe('RichTextEditorContent', () => {
    it('shows the initial content', () => {
        render(<Harness initialContent="Купить молоко" />)

        expect(screen.getByDisplayValue('Купить молоко')).toBeTruthy()
    })

    it('shows the placeholder once there is no content at all', () => {
        render(<Harness initialContent="" />)

        expect(screen.getByPlaceholderText('Описание')).toBeTruthy()
    })

    it('renders a pin for each inline mark, but not the block types', () => {
        render(<Harness initialContent="" />)

        expect(screen.getByRole('button', { name: 'Жирный' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Курсив' })).toBeTruthy()
        expect(
            screen.getByRole('button', { name: 'Подчёркнутый' }),
        ).toBeTruthy()
        expect(
            screen.getByRole('button', { name: 'Зачёркнутый' }),
        ).toBeTruthy()
        // block types were dropped — see useRichTextEditor's docstring
        expect(screen.queryByRole('button', { name: 'Заголовок' })).toBeNull()
        expect(screen.queryByRole('button', { name: 'Чек-лист' })).toBeNull()
        expect(screen.queryByRole('button', { name: 'Цитата' })).toBeNull()
    })

    it('shows "Готово" only while the editor is focused', () => {
        render(<Harness initialContent="" />)

        expect(screen.queryByRole('button', { name: 'Готово' })).toBeNull()

        fireEvent(screen.getByPlaceholderText('Описание'), 'focus')
        expect(screen.getByRole('button', { name: 'Готово' })).toBeTruthy()

        fireEvent(screen.getByPlaceholderText('Описание'), 'blur')
        expect(screen.queryByRole('button', { name: 'Готово' })).toBeNull()
    })

    it('calls onChange with the new HTML as the user types', () => {
        const onChange = jest.fn()
        render(<Harness initialContent="" onChange={onChange} />)

        fireEvent.changeText(
            screen.getByPlaceholderText('Описание'),
            'Купить хлеб',
        )

        expect(onChange).toHaveBeenCalledWith('Купить хлеб')
    })
})
