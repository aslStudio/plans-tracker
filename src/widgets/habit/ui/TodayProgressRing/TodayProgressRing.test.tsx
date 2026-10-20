import { render, screen } from '@/shared/lib/test-utils'

import { TodayProgressRing } from './TodayProgressRing'

describe('TodayProgressRing', () => {
    it('shows the completion percentage in the center', () => {
        render(<TodayProgressRing done={2} total={5} />)

        expect(screen.getByText('40%')).toBeTruthy()
    })

    it('shows progress beyond one hundred percent', () => {
        render(<TodayProgressRing done={11} total={10} percentage={110} />)
        expect(screen.getByText('110%')).toBeTruthy()
    })

    it('shows nothing in the center when there is nothing due today', () => {
        render(<TodayProgressRing done={0} total={0} />)

        expect(screen.queryByText('0%')).toBeNull()
    })
})
