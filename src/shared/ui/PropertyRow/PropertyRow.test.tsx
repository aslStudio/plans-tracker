import { render } from '@/shared/lib/test-utils'

import { PropertyRow } from './PropertyRow'

describe('PropertyRow', () => {
    it('renders the label and current value', () => {
        const { getByText } = render(
            <PropertyRow
                label="Приоритет"
                valueLabel="Средний"
                items={[
                    {
                        key: 'medium',
                        label: 'Средний',
                        isActive: true,
                        onPress: () => {},
                    },
                ]}
            />,
        )

        expect(getByText('Приоритет')).toBeTruthy()
        expect(getByText('Средний')).toBeTruthy()
    })
})
