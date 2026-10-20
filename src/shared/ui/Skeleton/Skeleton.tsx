import React, { useEffect } from 'react'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { type SkeletonProps } from './model'

const MIN_OPACITY = 0.4
const MAX_OPACITY = 1
const DURATION = 900

/** A pulsing placeholder block — flat color, breathing opacity, no shape opinions of its own. */
export const Skeleton: React.FC<SkeletonProps> = ({
    style,
    borderRadius = 8,
}) => {
    const { colors } = useTheme()
    const opacity = useSharedValue(MIN_OPACITY)

    useEffect(() => {
        opacity.set(
            withRepeat(
                withTiming(MAX_OPACITY, {
                    duration: DURATION,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true,
            ),
        )
    }, [opacity])

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                { backgroundColor: colors.fill.tertiary, borderRadius },
                style,
                animatedStyle,
            ]}
        />
    )
}
