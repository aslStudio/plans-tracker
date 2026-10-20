import type {
    Habit,
    HabitCompletion,
    Task,
    TaskCompletion,
    TaskStatus,
} from '@/shared/api'
import type {
    CalendarEvent,
    CalendarSettings,
} from '@/shared/api/calendar/model'
import { addDays } from '@/shared/lib/date'
import { agendaForDate } from '@/entities/calendar-event'

import type { WidgetAgendaItem } from '../../../../modules/calendar-widget-data'

export type CalendarWidgetCompletionState = {
    taskStatuses: TaskStatus[]
    taskCompletions: TaskCompletion[]
    habitCompletions: HabitCompletion[]
}

/** How many days ahead (inclusive of today) the widget's data window spans — enough that the small/large widgets rarely run dry on a quiet week, without the synced JSON growing unbounded. */
export const WIDGET_AGENDA_WINDOW_DAYS = 7

/**
 * Flattens `agendaForDate` across a rolling window of days into the plain
 * shape the native widget decodes — the widget itself has no recurrence
 * logic or repository access, so every occurrence needs to already be
 * resolved to one concrete date by the time it crosses the bridge.
 */
export function buildCalendarWidgetPayload(
    events: CalendarEvent[],
    tasks: Task[],
    habits: Habit[],
    today: string,
    settings: CalendarSettings,
    completionState: CalendarWidgetCompletionState,
): WidgetAgendaItem[] {
    const items: WidgetAgendaItem[] = []
    for (let offset = 0; offset < WIDGET_AGENDA_WINDOW_DAYS; offset += 1) {
        const date = addDays(today, offset)
        const dayItems = agendaForDate(
            events,
            tasks,
            habits,
            date,
            settings.showTasks,
            settings.showHabits,
            completionState,
        )
        for (const item of dayItems) {
            items.push({
                title: item.title,
                date,
                startMinute: item.startMinute,
                duration: item.duration,
                allDay: item.allDay,
                color: item.color,
                useAppAccent: item.source !== 'event',
                completed: item.completed ?? false,
            })
        }
    }
    return items
}
