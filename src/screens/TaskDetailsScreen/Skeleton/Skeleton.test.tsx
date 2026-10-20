import { render } from '@/shared/lib/test-utils'

import { TaskDetailsSkeleton } from './Skeleton'

describe('TaskDetailsSkeleton', () => {
    it('renders without crashing', () => {
        const { toJSON } = render(<TaskDetailsSkeleton onClose={() => {}} />)

        expect(toJSON()).toBeTruthy()
    })
})
