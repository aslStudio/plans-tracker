import { render, screen } from '@/shared/lib/test-utils'

import { Badge } from './Badge'

describe('Badge', () => {
    it('renders its children text', () => {
        render(<Badge view="primary">Новое</Badge>)
        expect(screen.getByText('Новое')).toBeTruthy()
    })

    it.each(['primary', 'secondary', 'tertiary'] as const)(
        'matches the snapshot for view="%s"',
        (view) => {
            const { toJSON } = render(<Badge view={view}>Метка</Badge>)
            expect(toJSON()).toMatchSnapshot()
        },
    )
})
