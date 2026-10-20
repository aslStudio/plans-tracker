import { localizedLabels } from '@/shared/lib/i18n'
import { toLocalDateString } from '@/shared/lib/date'

export type CalendarCell = { date: string; day: number } | null

export const WEEKDAY_LABELS = localizedLabels([
    'Пн',
    'Вт',
    'Ср',
    'Чт',
    'Пт',
    'Сб',
    'Вс',
])

const FULL_MONTHS = localizedLabels([
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
])

/** `"Октябрь 2026"` — a calendar header label for `monthDate`'s month. */
export function formatMonthLabel(monthDate: Date): string {
    return `${FULL_MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`
}

export function addMonths(monthDate: Date, delta: number): Date {
    return new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1)
}

/**
 * Monday-first 7-wide grid for `monthDate`'s month, padded with `null`
 * leading/trailing blanks so every row stays exactly 7 cells — explicit
 * rows (not a single `flexWrap` grid), same reasoning plans-tracker's
 * own month grids document: at a repeating `14.2857…%` cell width, Yoga's
 * line-wrapping can round enough at some container widths to wrap the 7th
 * cell onto its own row instead of filling the last column.
 */
export function buildMonthGrid(monthDate: Date): CalendarCell[][] {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7

    const cells: CalendarCell[] = [
        ...Array.from({ length: leadingBlanks }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            return { date: toLocalDateString(new Date(year, month, day)), day }
        }),
    ]
    const trailingBlanks = (7 - (cells.length % 7)) % 7
    const padded = [
        ...cells,
        ...Array.from({ length: trailingBlanks }, () => null),
    ]

    const rows: CalendarCell[][] = []
    for (let index = 0; index < padded.length; index += 7) {
        rows.push(padded.slice(index, index + 7))
    }
    return rows
}
