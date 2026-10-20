import { fireEvent, render, screen } from '@/shared/lib/test-utils'
import { StatisticsChart } from './StatisticsChart'
import type { StatisticsBucket } from './model'

it('connects elapsed points across empty days while leaving future dates unplotted', () => {
    const buckets: StatisticsBucket[] = [
        {
            date: '2026-10-12',
            label: '12',
            done: 1,
            total: 1,
            rate: 100,
            future: false,
        },
        {
            date: '2026-10-13',
            label: '13',
            done: 0,
            total: 0,
            rate: null,
            future: false,
        },
        {
            date: '2026-10-14',
            label: '14',
            done: 1,
            total: 2,
            rate: 50,
            future: false,
        },
        {
            date: '2026-10-15',
            label: '15',
            done: 0,
            total: 0,
            rate: null,
            future: true,
        },
    ]
    render(
        <StatisticsChart
            buckets={buckets}
            metric="rate"
            selected={null}
            onSelect={() => {}}
            average={75}
        />,
    )
    fireEvent(screen.getByTestId('statistics-chart'), 'layout', {
        nativeEvent: { layout: { width: 320, height: 140 } },
    })
    const lines = screen.getAllByTestId('statistics-chart-line')
    expect(lines).toHaveLength(1)
    // Three elapsed points form two connected curves; the future slot stays empty.
    expect(lines[0].props.d.match(/ C /g)).toHaveLength(2)
    expect(lines[0].props.d).toContain('112')
})
