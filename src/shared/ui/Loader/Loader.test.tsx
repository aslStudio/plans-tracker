import { render } from '@/shared/lib/test-utils'

import { Loader } from './Loader'

describe('Loader', () => {
    it('renders at the requested size', () => {
        const { toJSON } = render(<Loader size={24} color="brand" />)
        expect(toJSON()).toMatchSnapshot()
    })

    it('renders without crashing when animation is disabled', () => {
        const { toJSON } = render(
            <Loader size={24} color="brand" isAnimated={false} />,
        )
        expect(toJSON()).toBeTruthy()
    })
})
