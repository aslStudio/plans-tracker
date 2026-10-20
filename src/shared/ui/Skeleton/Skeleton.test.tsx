import type { ReactTestRendererJSON } from 'react-test-renderer'

import { render } from '@/shared/lib/test-utils'

import { Skeleton } from './Skeleton'

function single(node: ReactTestRendererJSON | ReactTestRendererJSON[] | null) {
    if (!node || Array.isArray(node)) throw new Error('Expected a single node')
    return node
}

describe('Skeleton', () => {
    it('renders with the given style and a default border radius', () => {
        const { toJSON } = render(
            <Skeleton style={{ width: 40, height: 16 }} />,
        )

        expect(single(toJSON()).props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ borderRadius: 8 }),
            ]),
        )
    })

    it('accepts a custom border radius', () => {
        const { toJSON } = render(
            <Skeleton style={{ width: 40, height: 40 }} borderRadius={20} />,
        )

        expect(single(toJSON()).props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ borderRadius: 20 }),
            ]),
        )
    })
})
