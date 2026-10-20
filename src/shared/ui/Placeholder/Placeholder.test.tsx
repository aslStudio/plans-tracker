import { Text } from 'react-native'

import { render, screen } from '@/shared/lib/test-utils'

import { Placeholder } from './Placeholder'

describe('Placeholder', () => {
    it('renders the title', () => {
        render(<Placeholder title="Здесь пока пусто" />)
        expect(screen.getByText('Здесь пока пусто')).toBeTruthy()
    })

    it('renders the description when provided', () => {
        render(<Placeholder title="Заголовок" description="Описание" />)
        expect(screen.getByText('Описание')).toBeTruthy()
    })

    it('omits the description when not provided', () => {
        render(<Placeholder title="Заголовок" />)
        expect(screen.queryByText('Описание')).toBeNull()
    })

    it('renders the children slot (e.g. an icon) above the title', () => {
        render(
            <Placeholder title="Заголовок">
                <Text testID="slot">icon</Text>
            </Placeholder>,
        )
        expect(screen.getByTestId('slot')).toBeTruthy()
    })

    it.each(['default', 'large'] as const)(
        'matches the snapshot for size="%s"',
        (size) => {
            const { toJSON } = render(
                <Placeholder
                    size={size}
                    title="Заголовок"
                    description="Описание"
                />,
            )
            expect(toJSON()).toMatchSnapshot()
        },
    )
})
