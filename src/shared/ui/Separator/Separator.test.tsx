import { render } from '@/shared/lib/test-utils'

import { Separator } from './Separator'

describe('Separator', () => {
    it('renders', () => {
        const { toJSON } = render(<Separator />)
        expect(toJSON()).toBeTruthy()
    })

    it('merges a custom style on top of the default one', () => {
        const { toJSON } = render(<Separator style={{ marginLeft: 16 }} />)
        expect(toJSON()).toMatchSnapshot()
    })
})
