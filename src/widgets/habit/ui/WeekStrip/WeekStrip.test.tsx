import { render } from '@/shared/lib/test-utils'

import { WeekStrip } from './WeekStrip'

describe('WeekStrip', () => {
    it('renders one element per day without crashing', () => {
        const days = [
            { date: '2026-10-10', state: 'done' as const },
            { date: '2026-10-11', state: 'missed' as const },
            { date: '2026-10-12', state: 'not-due' as const },
            { date: '2026-10-13', state: 'future' as const },
        ]
        const { toJSON } = render(<WeekStrip days={days} />)

        expect(toJSON()).toBeTruthy()
    })
})
