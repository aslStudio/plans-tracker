import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { render, screen } from '@/shared/lib/test-utils'
import { MemoryScreen } from './MemoryScreen'
import {
    cleanMemory,
    cloudStatus,
    memoryUsage,
    syncMemory,
    MemoryUserError,
} from '@/shared/lib/memory/service'
jest.mock('@/shared/lib/memory/service', () => {
    class MockMemoryUserError extends Error {}
    return {
        memoryUsage: jest.fn(async () => ({
            localBytes: 250,
            groups: [{ label: 'Задачи', bytes: 250, color: 'accent-blue' }],
            settings: { interval: 'day', enabled: false },
        })),
        cloudStatus: jest.fn(async () => ({
            available: false,
            message: 'iCloud недоступен',
        })),
        cleanMemory: jest.fn(),
        syncMemory: jest.fn(),
        updateMemorySettings: jest.fn(),
        MemoryUserError: MockMemoryUserError,
    }
})
// Keep the destructive confirmation interaction independent of animation timers.
jest.mock('@/shared/ui/DeleteConfirmationSheet', () => ({
    DeleteConfirmationSheet: ({
        visible,
        onConfirm,
        title,
    }: {
        visible: boolean
        onConfirm: () => void
        title: string
    }) => {
        const { Pressable, Text } =
            jest.requireActual<typeof import('react-native')>('react-native')
        return visible ? (
            <Pressable onPress={onConfirm}>
                <Text>{title}</Text>
            </Pressable>
        ) : null
    },
}))
it('requires confirmation, disables dismissal while cleaning, then shows the result', async () => {
    let finish!: (value: { removed: number; cloudPending: boolean }) => void
    jest.mocked(cleanMemory).mockImplementation(
        () =>
            new Promise((resolve) => {
                finish = resolve
            }),
    )
    const onBusyChange = jest.fn()
    render(<MemoryScreen onClose={jest.fn()} onBusyChange={onBusyChange} />)
    await screen.findAllByText('250 Б')
    fireEvent.press(screen.getByText('Очистить все данные'))
    expect(cleanMemory).not.toHaveBeenCalled()
    fireEvent.press(screen.getByText('Очистить все данные?'))
    await waitFor(() => expect(cleanMemory).toHaveBeenCalled())
    expect(screen.getByText('Идёт удаление данных')).toBeTruthy()
    expect(onBusyChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('button', { busy: true })).toBeDisabled()
    await act(async () => finish({ removed: 10, cloudPending: false }))
    await screen.findByText('Память очищена')
    expect(onBusyChange).toHaveBeenLastCalledWith(false)
    fireEvent.press(screen.getByText('Понятно'))
    expect(screen.queryByText('Память очищена')).toBeNull()
})

it('shows a generic message for a raw native sync error, not its own text', async () => {
    jest.mocked(cloudStatus).mockResolvedValueOnce({
        available: true,
        message: 'iCloud доступен',
    })
    jest.mocked(memoryUsage).mockResolvedValueOnce({
        localBytes: 250,
        groups: [{ label: 'Задачи', bytes: 250, color: 'accent-blue' }],
        settings: { interval: 'day', enabled: true },
    })
    jest.mocked(syncMemory).mockRejectedValueOnce(
        new Error(
            "The operation couldn't be completed. (CKErrorDomain error 4.)",
        ),
    )
    render(<MemoryScreen onClose={jest.fn()} onBusyChange={jest.fn()} />)

    fireEvent.press(await screen.findByText('Синхронизировать сейчас'))

    expect(await screen.findByText('Что-то пошло не так')).toBeTruthy()
    expect(screen.queryByText(/CKErrorDomain/)).toBeNull()
})

it('shows its own message for a known MemoryUserError during sync', async () => {
    jest.mocked(cloudStatus).mockResolvedValueOnce({
        available: true,
        message: 'iCloud доступен',
    })
    jest.mocked(memoryUsage).mockResolvedValueOnce({
        localBytes: 250,
        groups: [{ label: 'Задачи', bytes: 250, color: 'accent-blue' }],
        settings: { interval: 'day', enabled: true },
    })
    jest.mocked(syncMemory).mockRejectedValueOnce(
        new MemoryUserError('Аккаунт iCloud изменился.'),
    )
    render(<MemoryScreen onClose={jest.fn()} onBusyChange={jest.fn()} />)

    fireEvent.press(await screen.findByText('Синхронизировать сейчас'))

    expect(await screen.findByText('Аккаунт iCloud изменился.')).toBeTruthy()
})
