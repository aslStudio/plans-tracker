import type { CalendarEvent } from '@/shared/api/calendar/model'

/** Keep existing plain-text details visible when opening older plans. */
export function eventDescription(event: CalendarEvent): string {
    if (event.description !== undefined) return event.description
    return [event.location, event.notes]
        .filter(Boolean)
        .map(
            (text) =>
                `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>')}</p>`,
        )
        .join('')
}
