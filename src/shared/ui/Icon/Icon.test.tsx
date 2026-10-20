import { render, screen } from '@/shared/lib/test-utils'

import { Icon } from './Icon'

describe('Icon', () => {
    it('renders a mono icon by name', () => {
        render(<Icon name="plus" testID="icon" />)
        expect(screen.getByTestId('icon')).toBeTruthy()
    })

    it('applies the requested size to the underlying svg', () => {
        render(<Icon name="plus" size={40} testID="icon" />)
        expect(screen.getByTestId('icon').props.width).toBe(40)
        expect(screen.getByTestId('icon').props.height).toBe(40)
    })

    it('prefers explicit width/height over size', () => {
        render(
            <Icon name="plus" size={40} width={12} height={16} testID="icon" />,
        )
        expect(screen.getByTestId('icon').props.width).toBe(12)
        expect(screen.getByTestId('icon').props.height).toBe(16)
    })

    it('matches the snapshot', () => {
        const { toJSON } = render(<Icon name="search-outline" color="brand" />)
        expect(toJSON()).toMatchSnapshot()
    })
})
