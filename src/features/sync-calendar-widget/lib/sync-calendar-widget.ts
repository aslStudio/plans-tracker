import {
    calendarRepository,
    calendarSettings,
} from '@/shared/api/calendar/repository'
import { habitsRepository, tasksRepository } from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'

import { updateCalendarWidget } from '../../../../modules/calendar-widget-data'
import { buildCalendarWidgetPayload } from './build-widget-payload'

/**
 * Pushes the current upcoming-agenda window to the iOS Home Screen widget —
 * a plain one-shot refresh, not a subscription; call it after anything that
 * could change what the widget should show (app foreground, saving an
 * event/task, toggling a completion). No-op on Android/web, see
 * `updateCalendarWidget`.
 */
export async function syncCalendarWidget(): Promise<void> {
    const [
        events,
        tasks,
        habits,
        settings,
        taskStatuses,
        taskCompletions,
        habitCompletions,
    ] = await Promise.all([
        calendarRepository.list(),
        tasksRepository.list(),
        habitsRepository.list(),
        calendarSettings.get(),
        tasksRepository.listStatuses(),
        tasksRepository.listAllCompletions(),
        habitsRepository.listAllCompletions(),
    ])

    const items = buildCalendarWidgetPayload(
        events,
        tasks,
        habits,
        todayDateString(),
        settings,
        { taskStatuses, taskCompletions, habitCompletions },
    )
    updateCalendarWidget(items)
}
