import { Skeleton } from '@/shared/ui/Skeleton'
import { render } from '@/shared/lib/test-utils'

import { SkeletonText } from './SkeletonText'

describe('SkeletonText', () => {
    it('renders a line sized off the requested text size', () => {
        const { toJSON } = render(<SkeletonText size="title-1" width="60%" />)

        expect(toJSON()).toBeTruthy()
    })

    it('falls back to the body size and a 70% width by default', () => {
        const { UNSAFE_getByType } = render(<SkeletonText />)

        const view = UNSAFE_getByType(Skeleton)
        expect(view.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ width: '70%' })]),
        )
    })
})
