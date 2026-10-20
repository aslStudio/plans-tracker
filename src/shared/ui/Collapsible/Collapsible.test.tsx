import { Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'
import { Collapsible } from './Collapsible'

// Reanimated's default mock recreates shared values on every render, unlike
// native. Keep them stable to exercise a full measure/close/reopen cycle.
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mock = require('react-native-reanimated/mock')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useState } = require('react')
    return {
        ...mock,
        useSharedValue: function useTestSharedValue(initial: unknown) {
            const [shared] = useState(() => ({
                value: initial,
                get() {
                    return this.value
                },
                set(value: unknown) {
                    this.value = value
                },
            }))
            return shared
        },
    }
})

it('measures while hidden and preserves intrinsic height across repeated toggles', () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const content = (visible: boolean) => (
        <Collapsible visible={visible} testID="details">
            <Text>Время</Text>
        </Collapsible>
    )
    const { rerender } = render(content(false))
    fireEvent(
        screen.getByTestId('details-content', { includeHiddenElements: true }),
        'layout',
        {
            nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 96 } },
        },
    )
    for (let i = 0; i < 3; i++) {
        rerender(content(true))
        expect(timing).toHaveBeenLastCalledWith(96, expect.any(Object))
        expect(screen.getByText('Время')).toBeTruthy()
        rerender(content(false))
        expect(timing).toHaveBeenLastCalledWith(0, expect.any(Object))
        expect(screen.queryByText('Время')).toBeNull()
    }
    // The content can change size while hidden and still reopen correctly.
    fireEvent(
        screen.getByTestId('details-content', { includeHiddenElements: true }),
        'layout',
        {
            nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 144 } },
        },
    )
    rerender(content(true))
    expect(timing).toHaveBeenLastCalledWith(144, expect.any(Object))
    timing.mockRestore()
})
