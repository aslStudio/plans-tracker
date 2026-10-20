import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import type { SvgProps } from 'react-native-svg'

import { monoIcons } from '@/shared/config/icons'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { DefaultTextColor } from '@/shared/ui/TheText/model'

import type { MonoProps } from './model'
import { useStyles } from './styles'

const animatedIcons = Object.fromEntries(
    Object.entries(monoIcons).map(([name, Svg]) => [
        name,
        Animated.createAnimatedComponent(Svg),
    ]),
)

export type IconAnimatedProps = MonoProps

export function IconAnimated(props: IconAnimatedProps) {
    const {
        name,
        size = 24,
        width,
        height,
        style,
        testID,
        pointerEvents,
    } = props
    const styles = useStyles(size)
    const AnimatedSvg = animatedIcons[name]
    const themedColor = useThemeColor(props.color ?? DefaultTextColor)
    const resolvedColor = props.nativeColor ?? themedColor
    const color = useSharedValue(resolvedColor)

    useEffect(() => {
        color.set(withTiming(resolvedColor, { duration: 300 }))
    }, [color, resolvedColor])

    const animatedProps = useAnimatedProps<SvgProps>(() => ({
        color: color.get(),
    }))

    return (
        <View style={[styles.root, style]} pointerEvents={pointerEvents}>
            <AnimatedSvg
                width={width ?? size}
                height={height ?? size}
                testID={testID}
                animatedProps={animatedProps}
            />
        </View>
    )
}
