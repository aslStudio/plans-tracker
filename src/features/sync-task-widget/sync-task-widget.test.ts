import AsyncStorage from '@react-native-async-storage/async-storage'
import { tasksRepository, DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'
import { syncTaskWidget } from './index'
import {
    readPendingTaskToggles,
    acknowledgeTaskToggle,
    updateTaskWidget,
} from '../../../modules/task-widget-data'

jest.mock('../../../modules/task-widget-data', () => ({
    readPendingTaskToggles: jest.fn(),
    acknowledgeTaskToggle: jest.fn(),
    updateTaskWidget: jest.fn(),
}))
beforeEach(async () => {
    await AsyncStorage.clear()
    jest.clearAllMocks()
    jest.mocked(readPendingTaskToggles).mockResolvedValue([])
})

it('applies ordered check/uncheck actions and acknowledges only saved actions', async () => {
    const task = await tasksRepository.create({ title: 'Task' })
    jest.mocked(readPendingTaskToggles).mockResolvedValue([
        { id: '002', taskId: task.id, date: '2026-10-13', completed: false },
        { id: '001', taskId: task.id, date: '2026-10-13', completed: true },
    ])
    await syncTaskWidget()
    expect((await tasksRepository.get(task.id))?.statusId).toBe(TODO_STATUS_ID)
    expect(acknowledgeTaskToggle).toHaveBeenNthCalledWith(1, '001')
    expect(acknowledgeTaskToggle).toHaveBeenNthCalledWith(2, '002')
    expect(updateTaskWidget).toHaveBeenCalled()
})

it('keeps the occurrence date when the app opens after midnight', async () => {
    const task = await tasksRepository.create({
        title: 'Daily',
        repeat: { type: 'daily' },
    })
    jest.mocked(readPendingTaskToggles).mockResolvedValue([
        { id: '001', taskId: task.id, date: '2026-10-13', completed: true },
    ])
    await syncTaskWidget()
    expect(await tasksRepository.listCompletions(task.id)).toEqual([
        expect.objectContaining({ occurrenceDate: '2026-10-13' }),
    ])
    expect((await tasksRepository.get(task.id))?.statusId).toBe(TODO_STATUS_ID)
})

it('retains actions on write failure and can retry without duplicating completion', async () => {
    const task = await tasksRepository.create({ title: 'Task' })
    jest.mocked(readPendingTaskToggles).mockResolvedValue([
        { id: '001', taskId: task.id, date: '2026-10-13', completed: true },
    ])
    jest.spyOn(tasksRepository, 'update').mockRejectedValueOnce(
        new Error('disk'),
    )
    await expect(syncTaskWidget()).rejects.toThrow('disk')
    expect(acknowledgeTaskToggle).not.toHaveBeenCalled()
    await syncTaskWidget()
    expect((await tasksRepository.get(task.id))?.statusId).toBe(DONE_STATUS_ID)
    expect(acknowledgeTaskToggle).toHaveBeenCalledWith('001')
    jest.restoreAllMocks()
})

it('discards actions for deleted tasks without recreating them', async () => {
    jest.mocked(readPendingTaskToggles).mockResolvedValue([
        { id: '001', taskId: 'deleted', date: '2026-10-13', completed: true },
    ])
    await syncTaskWidget()
    expect(await tasksRepository.list()).toEqual([])
    expect(acknowledgeTaskToggle).toHaveBeenCalledWith('001')
})
