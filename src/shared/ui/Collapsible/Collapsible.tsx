import { useEffect, useRef, type PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { layoutTiming } from '@/shared/lib/motion'

/** Measure intrinsic content outside the shrinking layout, including while closed.
 * Only the clipping viewport changes height; children never reflow during a toggle.
 */
export function Collapsible({
    visible,
    children,
    testID,
}: PropsWithChildren<{ visible: boolean; testID?: string }>) {
    const expanded = useSharedValue(visible)
    const contentHeight = useSharedValue(0)
    const viewportHeight = useSharedValue(0)
    const measured = useRef(false)

    useEffect(() => {
        expanded.set(visible)
        viewportHeight.set(
            withTiming(visible ? contentHeight.get() : 0, layoutTiming),
        )
    }, [visible, expanded, contentHeight, viewportHeight])

    const style = useAnimatedStyle(() => ({ height: viewportHeight.get() }))

    return (
        <Animated.View
            testID={testID}
            style={[styles.viewport, style]}
            pointerEvents={visible ? 'auto' : 'none'}
            accessibilityElementsHidden={!visible}
            importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        >
            <View
                testID={testID ? `${testID}-content` : undefined}
                collapsable={false}
                style={styles.content}
                onLayout={({ nativeEvent: { layout } }) => {
                    if (
                        Math.abs(contentHeight.get() - layout.height) < 0.5 &&
                        measured.current
                    )
                        return
                    contentHeight.set(layout.height)
                    const target = expanded.get() ? layout.height : 0
                    // The first measurement establishes the initial layout, without a flash.
                    viewportHeight.set(
                        measured.current
                            ? withTiming(target, layoutTiming)
                            : target,
                    )
                    measured.current = true
                }}
            >
                {children}
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    viewport: { overflow: 'hidden', flexShrink: 0 },
    content: { position: 'absolute', top: 0, left: 0, right: 0, flexShrink: 0 },
})
