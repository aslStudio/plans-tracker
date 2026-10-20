import {
    getDayOptions,
    joinDateParts,
    monthOptions,
    splitDateString,
    yearOptions,
} from './date-wheel'

describe('monthOptions', () => {
    it('uses the same short Russian month names as the rest of the app, numbered 01-12', () => {
        expect(monthOptions[0]).toEqual({ label: 'янв', value: '01' })
        expect(monthOptions[11]).toEqual({ label: 'дек', value: '12' })
        expect(monthOptions).toHaveLength(12)
    })
})

describe('yearOptions', () => {
    it('spans a range around the current year', () => {
        const currentYear = String(new Date().getFullYear())
        expect(yearOptions.some((option) => option.value === currentYear)).toBe(
            true,
        )
    })
})

describe('getDayOptions', () => {
    it('returns 29 days for February in a leap year', () => {
        expect(getDayOptions('2024', '02')).toHaveLength(29)
    })

    it('returns 28 days for February in a non-leap year', () => {
        expect(getDayOptions('2025', '02')).toHaveLength(28)
    })

    it('returns 31 days for January', () => {
        expect(getDayOptions('2025', '01')).toHaveLength(31)
    })
})

describe('splitDateString', () => {
    it('splits a YYYY-MM-DD string into its parts', () => {
        expect(splitDateString('2026-10-12')).toEqual({
            year: '2026',
            month: '10',
            day: '12',
        })
    })
})

describe('joinDateParts', () => {
    it('joins parts back into a YYYY-MM-DD string', () => {
        expect(joinDateParts({ year: '2026', month: '10', day: '12' })).toBe(
            '2026-10-12',
        )
    })

    it('clamps the day down when the month changes to a shorter one', () => {
        expect(joinDateParts({ year: '2026', month: '02', day: '31' })).toBe(
            '2026-02-28',
        )
    })
})
