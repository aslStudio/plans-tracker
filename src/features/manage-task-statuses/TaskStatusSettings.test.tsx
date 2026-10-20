import AsyncStorage from '@react-native-async-storage/async-storage'
import { tasksRepository } from '@/shared/api'
import { fireEvent, render, screen, waitFor } from '@/shared/lib/test-utils'
import { TaskStatusSettings } from './TaskStatusSettings'
beforeEach(async () => {
    await AsyncStorage.clear()
})
it('creates and edits a custom status through the shared entity editor', async () => {
    render(<TaskStatusSettings />)
    await screen.findByText('К выполнению')
    fireEvent.press(screen.getByText('Добавить статус'))
    fireEvent.changeText(screen.getByPlaceholderText('Название'), 'В работе')
    fireEvent.press(screen.getByText('Сохранить'))
    await screen.findByText('В работе')
    fireEvent.press(screen.getByText('В работе'))
    fireEvent.changeText(screen.getByPlaceholderText('Название'), 'Проверка')
    fireEvent.press(screen.getByText('Сохранить'))
    await screen.findByText('Проверка')
    await waitFor(async () =>
        expect(
            (await tasksRepository.listStatuses()).map((s) => s.label),
        ).toEqual(['К выполнению', 'Проверка', 'Готово']),
    )
})
