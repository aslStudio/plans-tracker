import { SHORT_MONTHS } from '@/shared/lib/date'
import type { WheelPickerOption } from '@/shared/ui/WheelPicker'

export type DateParts = { day: string; month: string; year: string }

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = CURRENT_YEAR - 2
const MAX_YEAR = CURRENT_YEAR + 5

export const monthOptions: WheelPickerOption[] = SHORT_MONTHS.map(
    (label, index) => ({
        label,
        value: String(index + 1).padStart(2, '0'),
    }),
)

export const yearOptions: WheelPickerOption[] = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, index) => {
        const year = String(MIN_YEAR + index)
        return { label: year, value: year }
    },
)

export function getDayOptions(
    year: string,
    month: string,
): WheelPickerOption[] {
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate()
    return Array.from({ length: daysInMonth }, (_, index) => {
        const day = String(index + 1).padStart(2, '0')
        return { label: day, value: day }
    })
}

export function splitDateString(date: string): DateParts {
    const [year, month, day] = date.split('-')
    return { day, month, year }
}

/** Clamps the day if it moved to a shorter month (e.g. the 31st sliding from January into February). */
export function joinDateParts(parts: DateParts): string {
    const daysInMonth = new Date(
        Number(parts.year),
        Number(parts.month),
        0,
    ).getDate()
    const day = String(Math.min(Number(parts.day), daysInMonth)).padStart(
        2,
        '0',
    )
    return `${parts.year}-${parts.month}-${day}`
}
