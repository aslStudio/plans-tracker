import { render } from '@/shared/lib/test-utils'

import { HabitDetailSkeleton } from './Skeleton'

describe('HabitDetailSkeleton', () => {
    it('renders without crashing for an existing habit', () => {
        const { toJSON } = render(
            <HabitDetailSkeleton isNew={false} onClose={() => {}} />,
        )

        expect(toJSON()).toBeTruthy()
    })

    it('renders without crashing for a new habit', () => {
        const { toJSON } = render(
            <HabitDetailSkeleton isNew onClose={() => {}} />,
        )

        expect(toJSON()).toBeTruthy()
    })
})
