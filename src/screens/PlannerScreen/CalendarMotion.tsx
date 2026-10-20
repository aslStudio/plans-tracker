import type { PropsWithChildren } from 'react'
import { StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    Easing,
    ReduceMotion,
    type SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { useStyles } from './CalendarMotion.styles'

export type CalendarMotion = {
    kind: 'slide' | 'zoomIn' | 'zoomOut'
    direction: number
    x: number
    y: number
}
const timing = {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    reduceMotion: ReduceMotion.System,
}

/** The outgoing page reads the current motion, including when direction changes. */
export function CalendarPage({
    children,
    motion,
    onSwipe,
    enabled = true,
    gestureId,
}: PropsWithChildren<{
    motion: SharedValue<CalendarMotion>
    onSwipe: (direction: number) => void
    enabled?: boolean
    gestureId: string
}>) {
    const styles = useStyles()
    const drag = useSharedValue(0)
    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: drag.get() }],
    }))
    const swipe = Gesture.Pan()
        .withTestId(gestureId)
        .activeOffsetX([-24, 24])
        .failOffsetY([-18, 18])
        .enabled(enabled)
        .runOnJS(true)
        .onUpdate((e) => {
            drag.set(Math.max(-110, Math.min(110, e.translationX * 0.42)))
        })
        .onEnd((e, success) => {
            if (!success) {
                drag.set(withTiming(0, timing))
                return
            }
            if (Math.abs(e.translationX) > 55 || Math.abs(e.velocityX) > 600) {
                drag.set(0)
                onSwipe(e.translationX < 0 ? 1 : -1)
            } else drag.set(withTiming(0, timing))
        })
        .onFinalize(() => {
            drag.set(withTiming(0, timing))
        })
    const entering = () => {
        'worklet'
        const m = motion.get()
        return {
            initialValues: {
                opacity: 0,
                transform: [
                    {
                        translateX:
                            m.kind === 'slide' ? m.direction * 110 : m.x * 0.25,
                    },
                    { translateY: m.kind === 'slide' ? 0 : m.y * 0.18 },
                    {
                        scale:
                            m.kind === 'zoomIn'
                                ? 0.8
                                : m.kind === 'zoomOut'
                                  ? 1.22
                                  : 1,
                    },
                ],
            },
            animations: {
                opacity: withTiming(1, timing),
                transform: [
                    { translateX: withTiming(0, timing) },
                    { translateY: withTiming(0, timing) },
                    { scale: withTiming(1, timing) },
                ],
            },
        }
    }
    const exiting = () => {
        'worklet'
        const m = motion.get()
        return {
            initialValues: {
                opacity: 1,
                transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
            },
            animations: {
                opacity: withTiming(0, { ...timing, duration: 210 }),
                transform: [
                    {
                        translateX: withTiming(
                            m.kind === 'slide'
                                ? -m.direction * 110
                                : -m.x * 0.25,
                            timing,
                        ),
                    },
                    {
                        translateY: withTiming(
                            m.kind === 'slide' ? 0 : -m.y * 0.18,
                            timing,
                        ),
                    },
                    {
                        scale: withTiming(
                            m.kind === 'zoomIn'
                                ? 1.22
                                : m.kind === 'zoomOut'
                                  ? 0.8
                                  : 1,
                            timing,
                        ),
                    },
                ],
            },
        }
    }
    return (
        <Animated.View
            entering={entering}
            exiting={exiting}
            style={StyleSheet.absoluteFill}
        >
            <GestureDetector gesture={swipe}>
                <Animated.View style={[styles.fill, style]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    )
}
