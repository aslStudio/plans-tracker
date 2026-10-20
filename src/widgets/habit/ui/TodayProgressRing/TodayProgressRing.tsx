import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheText } from '@/shared/ui/TheText'

import type { TodayProgressRingProps } from './model'
import { useStyles } from './styles'

const STROKE_WIDTH = 5
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

/** Today's at-a-glance completion ring — how many of today's due habits are already done, out of how many are due at all. A plain dim ring (not a dash) with nothing in the middle once there's simply nothing due today. The fill animates towards whatever `done/total` becomes (a habit toggled, or the ring paged to a different day) instead of jumping straight there. */
export function TodayProgressRing({
    done,
    total,
    percentage,
    size = 64,
    color,
}: TodayProgressRingProps) {
    const { colors } = useTheme()
    const styles = useStyles()
    const radius = (size - STROKE_WIDTH) / 2
    const circumference = 2 * Math.PI * radius
    const progress = total > 0 ? Math.min(done / total, 1) : 0
    const extraProgress =
        percentage === undefined
            ? 0
            : Math.min(Math.max(percentage / 100 - 1, 0), 1)
    const animatedProgress = useSharedValue(progress)
    const animatedExtraProgress = useSharedValue(extraProgress)

    useEffect(() => {
        animatedProgress.set(withTiming(progress, { duration: 420 }))
    }, [animatedProgress, progress])
    useEffect(() => {
        animatedExtraProgress.set(withTiming(extraProgress, { duration: 420 }))
    }, [animatedExtraProgress, extraProgress])

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.get()),
    }))
    const innerRadius = radius - 8
    const innerCircumference = 2 * Math.PI * innerRadius
    const innerAnimatedProps = useAnimatedProps(() => ({
        strokeDashoffset:
            innerCircumference * (1 - animatedExtraProgress.get()),
    }))

    return (
        <View style={[styles.ring, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svgOverlay}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.fill.tertiary}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                />
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color ?? colors.brand}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={[circumference, circumference]}
                    animatedProps={animatedProps}
                    rotation={-90}
                    originX={size / 2}
                    originY={size / 2}
                />
                {percentage !== undefined && percentage > 100 && (
                    <>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={innerRadius}
                            stroke={colors.fill.tertiary}
                            strokeWidth={3}
                            fill="none"
                        />
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={innerRadius}
                            stroke={color ?? colors.brand}
                            strokeWidth={3}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={[
                                innerCircumference,
                                innerCircumference,
                            ]}
                            animatedProps={innerAnimatedProps}
                            rotation={-90}
                            originX={size / 2}
                            originY={size / 2}
                        />
                    </>
                )}
            </Svg>
            {(percentage !== undefined || total > 0) && (
                <TheText size="callout" weight="700">
                    {`${percentage ?? Math.round((done / total) * 100)}%`}
                </TheText>
            )}
        </View>
    )
}
