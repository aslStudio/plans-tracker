import { fireEvent, render, screen } from '@/shared/lib/test-utils'
import { StatisticsCard } from './StatisticsCard'

it('disables going back when the previous period has no data', () => {
    render(
        <StatisticsCard
            period="week"
            today="2026-10-15"
            groups={[]}
            isHabits={false}
            getProgress={() => ({ done: 0, total: 0 })}
        />,
    )
    expect(
        screen.getByRole('button', { name: 'Предыдущий период' }),
    ).toBeDisabled()
    expect(
        screen.getByRole('button', { name: 'Следующий период' }),
    ).toBeDisabled()
})

it('allows visiting an early completion next week and returning to this week', () => {
    render(
        <StatisticsCard
            period="week"
            today="2026-10-18"
            groups={[]}
            isHabits={false}
            getProgress={(date) =>
                date === '2026-10-19'
                    ? { done: 1, total: 1 }
                    : { done: 0, total: 0 }
            }
        />,
    )
    const next = screen.getByRole('button', { name: 'Следующий период' })
    expect(next).not.toBeDisabled()
    fireEvent.press(next)
    expect(screen.getByText('19 окт — 25 окт')).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'К текущему периоду' }))
    expect(screen.getByText('12 окт — 18 окт')).toBeTruthy()
})
