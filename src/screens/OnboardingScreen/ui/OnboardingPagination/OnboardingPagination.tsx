import { View } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'

import type { OnboardingPaginationProps } from './model'
import { useStyles } from './styles'

function PaginationDot({
    index,
    pageWidth,
    scrollX,
}: {
    index: number
    pageWidth: number
    scrollX: SharedValue<number>
}) {
    const styles = useStyles()
    const { colors } = useTheme()
    const inputRange = [
        (index - 1) * pageWidth,
        index * pageWidth,
        (index + 1) * pageWidth,
    ]
    const style = useAnimatedStyle(() => {
        const progress = scrollX.get()
        return {
            width: interpolate(
                progress,
                inputRange,
                [8, 22, 8],
                Extrapolation.CLAMP,
            ),
            backgroundColor: interpolateColor(progress, inputRange, [
                colors.fill.tertiary,
                colors.brand,
                colors.fill.tertiary,
            ]),
        }
    })

    return <Animated.View style={[styles.dot, style]} />
}

/** A row of dots marking progress through the onboarding pager — each dot continuously widens/recolors as the active page scrolls past it, instead of just snapping at the end of the swipe. */
export function OnboardingPagination({
    count,
    pageWidth,
    scrollX,
}: OnboardingPaginationProps) {
    const styles = useStyles()

    return (
        <View style={styles.root}>
            {Array.from({ length: count }, (_, index) => (
                <PaginationDot
                    key={index}
                    index={index}
                    pageWidth={pageWidth}
                    scrollX={scrollX}
                />
            ))}
        </View>
    )
}
