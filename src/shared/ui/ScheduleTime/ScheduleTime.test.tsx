import { fireEvent, render } from '@/shared/lib/test-utils'

import { ScheduleTime } from './ScheduleTime'

describe('ScheduleTime', () => {
    it('shows the toggle off and no time fields when unscheduled', () => {
        const { getByTestId, queryByText } = render(
            <ScheduleTime minute={null} onChange={() => {}} />,
        )

        expect(getByTestId('show-in-calendar').props.value).toBe(false)
        expect(queryByText('Время и длительность')).toBeNull()
    })

    it('shows the start/duration once scheduled', () => {
        const { getByText } = render(
            <ScheduleTime minute={540} duration={60} onChange={() => {}} />,
        )

        expect(getByText('Время и длительность')).toBeTruthy()
        expect(getByText('09:00 · 1 ч')).toBeTruthy()
    })

    it('enables scheduling with a default time when toggled on', () => {
        const onChange = jest.fn()
        const { getByTestId } = render(
            <ScheduleTime minute={null} duration={60} onChange={onChange} />,
        )

        fireEvent(getByTestId('show-in-calendar'), 'valueChange', true)

        expect(onChange).toHaveBeenCalledWith(540, 60)
    })

    it('clears the time when toggled off', () => {
        const onChange = jest.fn()
        const { getByTestId } = render(
            <ScheduleTime minute={540} duration={60} onChange={onChange} />,
        )

        fireEvent(getByTestId('show-in-calendar'), 'valueChange', false)

        expect(onChange).toHaveBeenCalledWith(null, 60)
    })
})

it('edits time in the shared sheet and only commits on confirmation', () => {
    const onChange = jest.fn()
    const { getByText, getByTestId } = render(
        <ScheduleTime minute={540} duration={60} onChange={onChange} />,
    )
    fireEvent.press(getByText('Время и длительность'))
    fireEvent(getByTestId('wheel-Начало · минуты'), 'momentumScrollEnd', {
        nativeEvent: { contentOffset: { y: 17 * 42 } },
    })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.press(getByText('Готово'))
    expect(onChange).toHaveBeenCalledWith(557, 60)
})

it('cancels a time edit without changing the schedule', () => {
    const onChange = jest.fn()
    const { getByText } = render(
        <ScheduleTime minute={540} onChange={onChange} />,
    )
    fireEvent.press(getByText('Время и длительность'))
    fireEvent.press(getByText('Отмена'))
    expect(onChange).not.toHaveBeenCalled()
})
