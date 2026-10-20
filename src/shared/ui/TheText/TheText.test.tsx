import { render, screen } from '@/shared/lib/test-utils'

import { TheText } from './TheText'

describe('TheText', () => {
    it.each(['400', '500', '600', '700'] as const)(
        'preserves system font variants at weight %s on iOS',
        (weight) => {
            render(
                <>
                    <TheText weight={weight}>Base</TheText>
                    <TheText font="rounded" weight={weight}>
                        Rounded
                    </TheText>
                    <TheText font="italic" weight={weight}>
                        Italic
                    </TheText>
                </>,
            )
            expect(screen.getByText('Base')).toHaveStyle({
                fontFamily: 'system-ui',
                fontWeight: weight,
                fontStyle: 'normal',
            })
            expect(screen.getByText('Rounded')).toHaveStyle({
                fontFamily: 'ui-rounded',
                fontWeight: weight,
                fontStyle: 'normal',
            })
            expect(screen.getByText('Italic')).toHaveStyle({
                fontFamily: 'system-ui',
                fontWeight: weight,
                fontStyle: 'italic',
            })
        },
    )

    it('keeps explicit style overrides', () => {
        render(
            <TheText weight="700" style={{ fontWeight: '500', fontSize: 24 }}>
                Override
            </TheText>,
        )
        expect(screen.getByText('Override')).toHaveStyle({
            fontWeight: '500',
            fontSize: 24,
        })
    })

    it('renders its children', () => {
        render(<TheText>Привет</TheText>)
        expect(screen.getByText('Привет')).toBeTruthy()
    })

    it('renders as a link when tag="link"', () => {
        render(
            <TheText tag="link" href="/">
                Домой
            </TheText>,
        )
        expect(screen.getByText('Домой')).toBeTruthy()
    })

    it('matches the snapshot for each size', () => {
        const sizes = ['large-title', 'body', 'footnote', 'caption-2'] as const
        for (const size of sizes) {
            const { toJSON } = render(<TheText size={size}>Aa</TheText>)
            expect(toJSON()).toMatchSnapshot(size)
        }
    })
})
