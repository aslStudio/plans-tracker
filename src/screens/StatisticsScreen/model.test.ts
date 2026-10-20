import {
    buildStatistics,
    hasStatisticsData,
    movePeriod,
    periodDays,
    periodRange,
} from './model'

describe('statistics calendar periods', () => {
    it('uses Monday through Sunday across year boundaries', () => {
        expect(periodRange('2026-01-01', 'week')).toEqual({
            start: '2025-12-29',
            end: '2026-01-04',
        })
    })
    it('keeps full calendar axes including future dates', () => {
        expect(periodDays('2024-02-01', 'month')).toHaveLength(29)
        expect(periodDays('2026-10-15', 'year').at(-1)).toBe('2026-12-31')
        expect(periodDays('2027-01-01', 'year')).toHaveLength(365)
    })
    it('moves months without overflowing at the end of a month', () => {
        expect(movePeriod('2026-03-31', 'month', -1)).toBe('2026-02-01')
        expect(movePeriod('2024-02-29', 'year', 1)).toBe('2025-01-01')
    })
})

describe('full statistics axis and averages', () => {
    it('keeps every day in the current week without counting future days', () => {
        const progress = jest.fn((date: string) => ({
            done: date <= '2026-10-15' ? 1 : 0,
            total: 2,
        }))
        const result = buildStatistics(
            '2026-10-15',
            'week',
            '2026-10-15',
            progress,
        )
        expect(result.buckets).toHaveLength(7)
        expect(result.buckets[6]).toMatchObject({
            date: '2026-10-18',
            future: true,
            rate: null,
        })
        expect(progress).toHaveBeenCalledTimes(7)
        expect(result.averageRate).toBe(50)
        expect(result.averageDone).toBe(1)
    })
    it('includes all 29 days of February in a leap year', () => {
        const result = buildStatistics(
            '2024-02-10',
            'month',
            '2024-02-10',
            () => ({ done: 0, total: 1 }),
        )
        expect(result.buckets).toHaveLength(29)
        expect(result.buckets.at(-1)?.date).toBe('2024-02-29')
        expect(result.averageRate).toBe(0)
    })
    it('groups a full year into twelve months and distinguishes empty and future months', () => {
        const result = buildStatistics(
            '2026-02-10',
            'year',
            '2026-02-10',
            (date) =>
                date === '2026-01-01'
                    ? { done: 1, total: 2 }
                    : { done: 0, total: 0 },
        )
        expect(result.buckets).toHaveLength(12)
        expect(result.buckets[0]).toMatchObject({
            date: '2026-01',
            done: 1,
            total: 2,
        })
        expect(result.buckets[0].rate).toBeCloseTo(50 / 31)
        expect(result.buckets[1]).toMatchObject({ rate: 0, future: false })
        expect(result.buckets[11]).toMatchObject({
            date: '2026-12',
            rate: null,
            future: true,
        })
        expect(result.averageRate).toBeCloseTo(50 / 41)
    })
    it('averages daily percentages rather than weighting busy days more heavily', () => {
        const result = buildStatistics(
            '2026-10-15',
            'week',
            '2026-10-15',
            (date) =>
                date === '2026-10-12'
                    ? { done: 1, total: 1 }
                    : date === '2026-10-13'
                      ? { done: 0, total: 9 }
                      : { done: 0, total: 0 },
        )
        expect(result.averageRate).toBe(25)
        expect(result.averageDone).toBe(0.25)
        expect(result.completeDays).toBe(1)
    })
})

describe('statistics history and early completions', () => {
    it('averages one completed day across all seven days of a completed week', () => {
        const result = buildStatistics(
            '2026-10-12',
            'week',
            '2026-10-18',
            (date) => ({
                done: date === '2026-10-12' ? 1 : 0,
                total: date === '2026-10-12' ? 1 : 0,
            }),
        )
        expect(result.averageRate).toBeCloseTo(100 / 7)
        expect(result.averageDone).toBeCloseTo(1 / 7)
        expect(result.completeDays).toBe(1)
    })
    it('shows tomorrow completion without including other future plans in totals or averages', () => {
        const result = buildStatistics(
            '2026-10-15',
            'week',
            '2026-10-15',
            (date) => ({
                done: date === '2026-10-16' ? 1 : 0,
                total: date >= '2026-10-16' ? 2 : 0,
            }),
        )
        expect(result.buckets[4]).toMatchObject({
            date: '2026-10-16',
            done: 1,
            total: 2,
            rate: 50,
            future: false,
        })
        expect(result.buckets[5]).toMatchObject({ rate: null, future: true })
        expect(result.done).toBe(1)
        expect(result.total).toBe(2)
        expect(result.averageRate).toBe(10)
    })
    it('shows an early completion in a future year and month', () => {
        const progress = (date: string) => ({
            done: date === '2027-01-01' ? 1 : 0,
            total: date === '2027-01-01' ? 1 : 0,
        })
        const result = buildStatistics(
            '2027-01-01',
            'year',
            '2026-12-31',
            progress,
        )
        expect(result.buckets[0]).toMatchObject({
            date: '2027-01',
            rate: 100,
            future: false,
        })
        expect(result.buckets[1]).toMatchObject({ future: true, rate: null })
        expect(
            hasStatisticsData('2027-01-01', 'month', '2026-12-31', progress),
        ).toBe(true)
    })
    it('requires history in the destination period, including uncompleted past plans', () => {
        const empty = () => ({ done: 0, total: 0 })
        expect(
            hasStatisticsData('2026-10-05', 'week', '2026-10-15', empty),
        ).toBe(false)
        expect(
            hasStatisticsData('2026-10-05', 'week', '2026-10-15', () => ({
                done: 0,
                total: 1,
            })),
        ).toBe(true)
        expect(
            hasStatisticsData('2026-10-19', 'week', '2026-10-15', () => ({
                done: 0,
                total: 1,
            })),
        ).toBe(false)
    })
})
