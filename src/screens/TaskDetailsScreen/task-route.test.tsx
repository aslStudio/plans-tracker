import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, render, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'
import TaskDetailsRoute from '@/app/task/[id]'
import { tasksRepository } from '@/shared/api'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { setLanguage } from '@/shared/lib/i18n'
import { TaskDetailsScreen, type TaskDetailsScreenProps } from './index'

const mockParams = { id: '', date: '2026-10-20' }
const mockBack = jest.fn()
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => mockParams,
    useRouter: () => ({ canGoBack: () => true, back: mockBack }),
}))
jest.mock('@/shared/lib/toast/app-toast', () => ({ showAppToast: jest.fn() }))
jest.mock('@/screens/TaskDetailsScreen', () => ({
    ...jest.requireActual('@/screens/TaskDetailsScreen'),
    TaskDetailsScreen: jest.fn(() => null),
    TaskDetailsSkeleton: () => null,
}))
jest.mock('@/shared/ui/SkeletonWrapper', () => ({
    SkeletonWrapper: ({ children }: { children: React.ReactNode }) => children,
}))
function props(): TaskDetailsScreenProps {
    return jest.mocked(TaskDetailsScreen).mock.calls.at(-1)![0]
}
beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
    await setLanguage('ru')
    const task = await tasksRepository.create({
        title: 'Trip',
        startDate: '2026-10-20',
        endDate: '2026-10-21',
    })
    mockParams.id = task.id
})
afterEach(() => jest.restoreAllMocks())
async function openTask() {
    render(<TaskDetailsRoute />)
    await waitFor(() => expect(TaskDetailsScreen).toHaveBeenCalled())
}
it('persists both dates together and reports the corrected end after saving', async () => {
    const update = jest.spyOn(tasksRepository, 'updateOccurrence')
    await openTask()
    act(() => props().onChange({ startDate: '2026-10-22' }))
    expect(props().draft.endDate).toBe('2026-10-22')
    expect(update).toHaveBeenCalledWith(mockParams.id, '2026-10-20', {
        startDate: '2026-10-22',
        endDate: '2026-10-22',
    })
    await act(async () => {
        await props().onClose()
    })
    expect(await tasksRepository.get(mockParams.id)).toMatchObject({
        startDate: '2026-10-22',
        endDate: '2026-10-22',
    })
    expect(showAppToast).toHaveBeenCalledWith(
        expect.objectContaining({
            title: 'Задача обновлена',
            description: 'Дата окончания также перенесена на 22 окт',
        }),
        360,
    )
})
it('does not claim an automatic adjustment after a manual end-date change', async () => {
    await openTask()
    act(() => props().onChange({ startDate: '2026-10-22' }))
    act(() => props().onChange({ endDate: '2026-10-25' }))
    await act(async () => {
        await props().onClose()
    })
    expect(showAppToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Изменения сохранены' }),
        360,
    )
})
it('keeps valid end dates and opening without edits does not show a success toast', async () => {
    await openTask()
    await act(async () => {
        await props().onClose()
    })
    expect(showAppToast).not.toHaveBeenCalled()
})
it('does not announce success if saving the corrected range fails', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    await openTask()
    jest.spyOn(tasksRepository, 'updateOccurrence').mockRejectedValue(
        new Error('storage unavailable'),
    )
    await act(async () => {
        props().onChange({ startDate: '2026-10-22' })
    })
    await act(async () => {
        await props().onClose()
    })
    expect(showAppToast).not.toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()
    expect(props().draft).toMatchObject({
        startDate: '2026-10-22',
        endDate: '2026-10-22',
    })
})
