import { Text, View } from 'react-native'
import { State } from 'react-native-gesture-handler'
import {
    fireGestureHandler,
    getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils'
import { act, render, screen } from '@/shared/lib/test-utils'
import { DragDropList, DragSource, DropZone } from './DragDropList'

function setup() {
    const onDrop = jest.fn()
    render(
        <DragDropList onDrop={onDrop}>
            <DropZone id="today">
                <DragSource
                    item={{ id: 'task', title: 'Релиз', from: 'today' }}
                >
                    <Text>Релиз</Text>
                </DragSource>
            </DropZone>
            <DropZone id="tomorrow">
                <Text>Завтра</Text>
            </DropZone>
        </DragDropList>,
    )
    for (const node of screen.UNSAFE_getAllByType(View)) {
        const instance = node.instance as {
            measureInWindow?: (
                callback: (x: number, y: number, w: number, h: number) => void,
            ) => void
        } | null
        if (instance?.measureInWindow)
            jest.spyOn(instance, 'measureInWindow').mockImplementation(
                function (this: { props: { testID?: string } }, callback) {
                    const id = this.props.testID
                    callback(
                        0,
                        id === 'drop-zone-tomorrow' ? 200 : 0,
                        400,
                        id === 'drag-drop-viewport' ? 600 : 180,
                    )
                },
            )
    }
    return onDrop
}
afterEach(() => jest.restoreAllMocks())
it('drops onto the chosen day after a long-hold drag', () => {
    const onDrop = setup()
    act(() =>
        fireGestureHandler(getByGestureTestId('drag-today-task'), [
            { state: State.BEGAN, absoluteX: 150, absoluteY: 80 },
            { state: State.ACTIVE, absoluteX: 150, absoluteY: 80 },
            { state: State.ACTIVE, absoluteX: 150, absoluteY: 260 },
            { state: State.END, absoluteX: 150, absoluteY: 260 },
        ]),
    )
    expect(onDrop).toHaveBeenCalledWith(
        { id: 'task', title: 'Релиз', from: 'today' },
        'tomorrow',
    )
})
it.each([80, 700])(
    'does not move a task when released on its own day or outside the list (%s)',
    (y) => {
        const onDrop = setup()
        act(() =>
            fireGestureHandler(getByGestureTestId('drag-today-task'), [
                { state: State.BEGAN, absoluteX: 150, absoluteY: 80 },
                { state: State.ACTIVE, absoluteX: 150, absoluteY: 80 },
                { state: State.END, absoluteX: 150, absoluteY: y },
            ]),
        )
        expect(onDrop).not.toHaveBeenCalled()
    },
)
it('cancels an interrupted drag without moving the task', () => {
    const onDrop = setup()
    act(() =>
        fireGestureHandler(getByGestureTestId('drag-today-task'), [
            { state: State.BEGAN, absoluteX: 150, absoluteY: 80 },
            { state: State.ACTIVE, absoluteX: 150, absoluteY: 260 },
            { state: State.CANCELLED, absoluteX: 150, absoluteY: 260 },
        ]),
    )
    expect(onDrop).not.toHaveBeenCalled()
})
