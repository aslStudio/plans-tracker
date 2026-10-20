import { generateId } from '../common/id'
import { createLocalCollectionStore } from '../common/local-collection-store'
import { createLocalValueStore } from '../common/local-value-store'
import type { CalendarEvent, CalendarSettings } from './model'
import { validateEvent } from '@/entities/calendar-event'

const store = createLocalCollectionStore<CalendarEvent>(
    'plans-tracker.calendar-events',
)
const calendarSettingsStore = createLocalValueStore<CalendarSettings>(
    'plans-tracker.calendar-settings',
    { showTasks: true, showHabits: true, viewMode: 'day' },
)
export const calendarSettings = {
    ...calendarSettingsStore,
    async get(): Promise<CalendarSettings> {
        const stored = await calendarSettingsStore.get()
        const viewMode = stored.viewMode
        return {
            showTasks: true,
            showHabits: true,
            viewMode:
                viewMode === '3day' ||
                viewMode === 'week' ||
                viewMode === 'month'
                    ? viewMode
                    : 'day',
        }
    },
}
export const calendarRepository = {
    list: store.list,
    remove: store.remove,
    async save(event: CalendarEvent) {
        const error = validateEvent(event)
        if (error) throw new Error(error)
        return event.id
            ? store.update(event.id, event)
            : store.insert({ ...event, id: generateId() })
    },
}
