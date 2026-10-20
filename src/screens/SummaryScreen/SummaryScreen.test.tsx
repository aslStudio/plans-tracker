import { render, screen } from '@/shared/lib/test-utils'

import { SummaryScreen } from './SummaryScreen'

describe('SummaryScreen', () => {
    it('renders the empty state when there are no stats', () => {
        render(<SummaryScreen stats={[]} />)

        expect(screen.getByText('Пока нечего показать')).toBeTruthy()
    })

    it('renders each stat with its value', () => {
        render(
            <SummaryScreen
                stats={[
                    {
                        id: 'tasks-today',
                        label: 'Задачи сегодня',
                        value: '2 / 5',
                    },
                ]}
            />,
        )

        expect(screen.getByText('Задачи сегодня')).toBeTruthy()
        expect(screen.getByText('2 / 5')).toBeTruthy()
    })
})
