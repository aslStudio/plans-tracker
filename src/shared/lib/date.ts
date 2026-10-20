import { localizedLabels } from '@/shared/lib/i18n'
/** `YYYY-MM-DD` built from local date parts — never `date.toISOString()`, which is UTC and can land on the wrong calendar day. */
export function toLocalDateString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function todayDateString(): string {
    return toLocalDateString(new Date())
}

/** Inverse of `toLocalDateString` — for handing a stored `YYYY-MM-DD` to a native `Date`-based picker. */
export function parseLocalDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function addDays(dateString: string, days: number): string {
    const [year, month, day] = dateString.split('-').map(Number)
    return toLocalDateString(new Date(year, month - 1, day + days))
}

export function tomorrowDateString(): string {
    return addDays(todayDateString(), 1)
}

export const SHORT_MONTHS = localizedLabels([
    'янв',
    'фев',
    'мар',
    'апр',
    'мая',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
])

/** `"10 окт"` — for a short inline deadline label, not a full calendar date. */
export function formatShortDate(dateString: string): string {
    const [, month, day] = dateString.split('-').map(Number)
    return `${day} ${SHORT_MONTHS[month - 1]}`
}

/** `"10 окт"` for a single-day span, `"10 окт - 15 окт"` once start and end actually differ. */
export function formatDateRange(startDate: string, endDate: string): string {
    if (startDate === endDate) return formatShortDate(startDate)
    return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
}
