import {
    addDays,
    formatDateRange,
    formatShortDate,
    toLocalDateString,
} from './date'

describe('toLocalDateString', () => {
    it('formats using local date parts, zero-padded', () => {
        expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
        expect(toLocalDateString(new Date(2026, 9, 31))).toBe('2026-10-31')
    })
})

describe('addDays', () => {
    it('adds days within the same month', () => {
        expect(addDays('2026-01-05', 1)).toBe('2026-01-06')
    })

    it('rolls over into the next month', () => {
        expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    })

    it('rolls over into the next year', () => {
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    })

    it('supports negative offsets', () => {
        expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    })
})

describe('formatShortDate', () => {
    it('formats as "day month" in Russian short form', () => {
        expect(formatShortDate('2026-10-10')).toBe('10 окт')
        expect(formatShortDate('2026-01-01')).toBe('1 янв')
    })
})

describe('formatDateRange', () => {
    it('formats as a single short date when start and end are the same', () => {
        expect(formatDateRange('2026-10-10', '2026-10-10')).toBe('10 окт')
    })

    it('formats as "start - end" once they differ', () => {
        expect(formatDateRange('2026-10-10', '2026-10-15')).toBe(
            '10 окт - 15 окт',
        )
    })
})
