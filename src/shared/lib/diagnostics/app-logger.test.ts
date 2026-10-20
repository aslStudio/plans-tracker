import AsyncStorage from '@react-native-async-storage/async-storage'

import {
    clearAppLogs,
    formatAppLogs,
    listAppLogs,
    logError,
    logInfo,
} from './app-logger'

beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-10-13T09:00:00.000Z'))
    await AsyncStorage.clear()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('app logger', () => {
    it('stores structured events with error stack details', async () => {
        const error = new Error('Storage failed')
        await logInfo('tasks', 'task_saved', { fields: ['title', 'startDate'] })
        await logError('storage', 'update_failed', error, {
            storageKey: 'tasks',
        })

        const entries = await listAppLogs()
        expect(entries).toHaveLength(2)
        expect(entries[0]).toMatchObject({
            level: 'INFO',
            scope: 'tasks',
            event: 'task_saved',
        })
        expect(entries[1].details?.error).toMatchObject({
            message: 'Storage failed',
        })
        expect(formatAppLogs(entries)).toContain(
            '[ERROR] storage.update_failed',
        )
    })

    it("drops the previous day's entries automatically", async () => {
        await logInfo('app', 'previous_day')
        jest.setSystemTime(new Date('2026-10-14T00:01:00.000Z'))

        expect(await listAppLogs()).toEqual([])
        await logInfo('app', 'current_day')
        expect((await listAppLogs()).map((entry) => entry.event)).toEqual([
            'current_day',
        ])
    })

    it('clears all stored entries when requested', async () => {
        await logInfo('app', 'before_clear')
        await clearAppLogs()

        expect(await listAppLogs()).toEqual([])
    })
})
