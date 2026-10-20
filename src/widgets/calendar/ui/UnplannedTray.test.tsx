import { State } from 'react-native-gesture-handler'
import {
    fireGestureHandler,
    getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils'
import { act, fireEvent, render, screen } from '@/shared/lib/test-utils'
import { emptyEvent, type AgendaItem } from '@/entities/calendar-event'
import { UnplannedTray } from './UnplannedTray'

const item: AgendaItem = {
    ...emptyEvent('2026-10-13'),
    id: 'habit',
    title: 'Чтение',
    source: 'habit',
    link: { type: 'habit', id: 'habit' },
}
function setup() {
    const handlers = {
        onStart: jest.fn(),
        onMove: jest.fn(),
        onEnd: jest.fn(),
        onCancel: jest.fn(),
    }
    const onOpen = jest.fn()
    render(
        <UnplannedTray
            items={[item]}
            dragging={false}
            handlers={handlers}
            onOpen={onOpen}
        />,
    )
    return { handlers, onOpen }
}
it('forwards the dragged source and window coordinates, without opening a second editor', () => {
    const { handlers, onOpen } = setup()
    act(() =>
        fireGestureHandler(getByGestureTestId('unplanned-habit-habit'), [
            { state: State.BEGAN, absoluteX: 100, absoluteY: 200 },
            { state: State.ACTIVE, absoluteX: 100, absoluteY: 200 },
            { state: State.ACTIVE, absoluteX: 160, absoluteY: 420 },
            { state: State.END, absoluteX: 160, absoluteY: 450 },
        ]),
    )
    expect(handlers.onStart).toHaveBeenCalledWith(item, 100, 200)
    expect(handlers.onEnd).toHaveBeenCalledWith(160, 450)
    fireEvent.press(
        screen.getByRole('button', { name: 'Запланировать: Чтение' }),
    )
    expect(onOpen).not.toHaveBeenCalled()
})
it('cancels an interrupted drag without assigning a time', () => {
    const { handlers } = setup()
    act(() =>
        fireGestureHandler(getByGestureTestId('unplanned-habit-habit'), [
            { state: State.BEGAN },
            { state: State.ACTIVE },
            { state: State.CANCELLED },
        ]),
    )
    expect(handlers.onCancel).toHaveBeenCalledTimes(1)
    expect(handlers.onEnd).not.toHaveBeenCalled()
})
