import { repeatSummaryLabel, toggleWeekday } from './repeat-picker'

describe('toggleWeekday', () => {
    it('adds a day that is not yet selected, keeping the result sorted', () => {
        expect(toggleWeekday([1, 5], 3)).toEqual([1, 3, 5])
    })

    it('removes a day that is already selected', () => {
        expect(toggleWeekday([1, 3, 5], 3)).toEqual([1, 5])
    })

    it('refuses to remove the last remaining day', () => {
        expect(toggleWeekday([3], 3)).toEqual([3])
    })
})

describe('repeatSummaryLabel', () => {
    it('describes every repeat rule type', () => {
        expect(repeatSummaryLabel({ type: 'daily' })).toBe('Каждый день')
        expect(repeatSummaryLabel({ type: 'weekly', daysOfWeek: [1, 3] })).toBe(
            'По дням недели',
        )
        expect(repeatSummaryLabel({ type: 'monthly', dayOfMonth: 5 })).toBe(
            'Каждое 5 число',
        )
        expect(repeatSummaryLabel({ type: 'custom', everyNDays: 3 })).toBe(
            'Каждые 3 дн.',
        )
    })
})
