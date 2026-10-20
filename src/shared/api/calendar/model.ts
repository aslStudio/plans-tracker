import type { RepeatRule } from '../common/types'

export type CalendarEvent = {
    id: string
    title: string
    date: string
    startMinute: number
    duration: number
    allDay: boolean
    color: string
    /** Rich-text HTML; older plans use notes/location until edited. */
    description?: string
    notes: string
    location: string
    repeat: RepeatRule | null
    until: string | null
    excludedDates: string[]
    link: { type: 'task' | 'habit'; id: string } | null
}
export type CalendarViewMode = 'day' | '3day' | 'week' | 'month'
export type CalendarSettings = {
    showTasks: boolean
    showHabits: boolean
    viewMode?: CalendarViewMode
}
