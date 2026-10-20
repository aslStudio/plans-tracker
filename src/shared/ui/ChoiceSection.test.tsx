import { fireEvent, waitFor } from '@testing-library/react-native'
import { render, screen } from '@/shared/lib/test-utils'
import { ChoiceSection } from './ChoiceSection'

it.each(['Новая категория', 'Новая группа', 'Новый приоритет'])(
    'creates and selects a new option via %s',
    async (title) => {
        const onChange = jest.fn()
        const onSubmit = jest.fn().mockResolvedValue({ id: 'created' })
        render(
            <ChoiceSection
                title="Выбор"
                options={[{ id: 'old', label: 'Первый' }]}
                value="old"
                onChange={onChange}
                toggleable
                creation={{ title, allowNoColor: true, onSubmit }}
            />,
        )
        fireEvent.press(screen.getByRole('button', { name: title }))
        fireEvent.changeText(screen.getByPlaceholderText('Название'), 'Новый')
        fireEvent.press(screen.getByText('Сохранить'))
        await waitFor(() => expect(onChange).toHaveBeenCalledWith('created'))
        expect(onSubmit).toHaveBeenCalledWith({ label: 'Новый', color: null })
    },
)
