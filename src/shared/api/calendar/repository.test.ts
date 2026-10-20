import AsyncStorage from '@react-native-async-storage/async-storage'
import { calendarRepository, calendarSettings } from './repository'
import { emptyEvent, eventOnDate } from '@/entities/calendar-event'

beforeEach(async () => {
    await AsyncStorage.clear()
})
it('persists, updates and removes an event without changing its identity', async () => {
    const created = await calendarRepository.save({
        ...emptyEvent('2026-10-13', 557),
        title: 'Фокус',
        duration: 43,
    })
    expect(created.id).toBeTruthy()
    expect(await calendarRepository.list()).toEqual([created])
    const updated = await calendarRepository.save({
        ...created,
        title: 'Новый план',
    })
    expect(updated.id).toBe(created.id)
    expect((await calendarRepository.list())[0].startMinute).toBe(557)
    await calendarRepository.remove(created.id)
    expect(await calendarRepository.list()).toEqual([])
})
it('persists an excluded occurrence without deleting the series', async () => {
    const created = await calendarRepository.save({
        ...emptyEvent('2026-10-13'),
        title: 'Чтение',
        repeat: { type: 'daily' },
    })
    await calendarRepository.save({ ...created, excludedDates: ['2026-10-14'] })
    const [saved] = await calendarRepository.list()
    expect(eventOnDate(saved, '2026-10-14')).toBe(false)
    expect(eventOnDate(saved, '2026-10-15')).toBe(true)
})
it('rejects invalid input before writing and preserves stored events', async () => {
    await expect(
        calendarRepository.save(emptyEvent('2026-10-13')),
    ).rejects.toThrow('Добавьте название')
    expect(await calendarRepository.list()).toEqual([])
})
it('keeps task and habit overlays enabled when reading legacy visibility settings', async () => {
    await calendarSettings.update({ showTasks: false })
    expect(await calendarSettings.get()).toEqual({
        showTasks: true,
        showHabits: true,
        viewMode: 'day',
    })
})

it.each(['day', '3day', 'week', 'month'] as const)(
    'persists the %s calendar view',
    async (viewMode) => {
        await calendarSettings.update({ viewMode })
        expect((await calendarSettings.get()).viewMode).toBe(viewMode)
    },
)

it('defaults to day for old or invalid saved preferences', async () => {
    await AsyncStorage.setItem(
        'plans-tracker.calendar-settings',
        JSON.stringify({ showTasks: true }),
    )
    expect((await calendarSettings.get()).viewMode).toBe('day')
    await AsyncStorage.setItem(
        'plans-tracker.calendar-settings',
        JSON.stringify({ viewMode: 'invalid' }),
    )
    expect((await calendarSettings.get()).viewMode).toBe('day')
})
