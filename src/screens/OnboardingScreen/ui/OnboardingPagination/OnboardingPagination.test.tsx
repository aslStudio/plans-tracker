import type { ReactTestRendererJSON } from 'react-test-renderer'
import { useSharedValue } from 'react-native-reanimated'
import { render } from '@/shared/lib/test-utils'

import { OnboardingPagination } from './OnboardingPagination'

function root(node: ReactTestRendererJSON | ReactTestRendererJSON[] | null) {
    if (!node || Array.isArray(node)) throw new Error('Expected a single root')
    return node
}

function Harness({ initial }: { initial: number }) {
    const scrollX = useSharedValue(initial)
    return <OnboardingPagination count={4} pageWidth={320} scrollX={scrollX} />
}

// `interpolate`/`interpolateColor` are no-ops under the jest reanimated
// mock, so the per-dot width/color this component computes can't be
// asserted here — this only checks that one dot renders per page and
// that scrolling to any position doesn't crash.
describe('OnboardingPagination', () => {
    it('renders one dot per page', () => {
        const { toJSON } = render(<Harness initial={0} />)

        expect(root(toJSON()).children).toHaveLength(4)
    })

    it('renders without crashing at a non-zero scroll position', () => {
        const { toJSON } = render(<Harness initial={960} />)

        expect(toJSON()).toBeTruthy()
    })
})
