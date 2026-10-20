import { useEffect } from 'react'
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'

import { useThemeColor } from '@/shared/lib/theme/use-theme-color'

import LoaderIcon from './loader.svg'
import type { LoaderProps } from './model'

export function Loader({ size, color, style, isAnimated = true }: LoaderProps) {
    const progress = useSharedValue(0)
    const resolvedColor = useThemeColor(color)

    useEffect(() => {
        progress.set(0)
        if (isAnimated) {
            progress.set(
                withRepeat(
                    withTiming(1, { duration: 1000, easing: Easing.linear }),
                    -1,
                ),
            )
        }
        return () => cancelAnimation(progress)
    }, [isAnimated, progress])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${2 * Math.PI * (progress.get() - 0.25)}rad` }],
    }))

    return (
        <Animated.View
            style={[animatedStyle, { width: size, height: size }, style]}
        >
            <LoaderIcon width={size} height={size} color={resolvedColor} />
        </Animated.View>
    )
}
