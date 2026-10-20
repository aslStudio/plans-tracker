import { addMonths, buildMonthGrid } from './calendar-grid'

describe('addMonths', () => {
    it('moves to the 1st of the target month', () => {
        expect(addMonths(new Date(2026, 9, 15), 1)).toEqual(
            new Date(2026, 10, 1),
        )
        expect(addMonths(new Date(2026, 0, 15), -1)).toEqual(
            new Date(2025, 11, 1),
        )
    })
})

describe('buildMonthGrid', () => {
    it('keeps every row exactly 7 cells wide', () => {
        const rows = buildMonthGrid(new Date(2026, 9, 1))
        for (const row of rows) expect(row).toHaveLength(7)
    })

    it('pads October 2026 (starts on a Thursday) with 3 leading blanks', () => {
        const rows = buildMonthGrid(new Date(2026, 9, 1))
        expect(rows[0][0]).toBeNull()
        expect(rows[0][1]).toBeNull()
        expect(rows[0][2]).toBeNull()
        expect(rows[0][3]).toEqual({ date: '2026-10-01', day: 1 })
    })

    it('includes every day of the month exactly once', () => {
        const rows = buildMonthGrid(new Date(2026, 9, 1))
        const days = rows
            .flat()
            .filter((cell) => cell !== null)
            .map((cell) => cell!.day)
        expect(days).toEqual(
            Array.from({ length: 31 }, (_, index) => index + 1),
        )
    })

    it('pads the trailing row back out to 7 cells', () => {
        const rows = buildMonthGrid(new Date(2026, 9, 1))
        const lastRow = rows[rows.length - 1]
        expect(lastRow).toHaveLength(7)
    })
})
