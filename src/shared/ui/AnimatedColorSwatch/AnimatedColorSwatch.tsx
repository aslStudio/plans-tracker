import { useEffect, type ReactNode } from 'react'
import {
    Pressable,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from 'react-native'
import Animated, {
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'

export function AnimatedColorSwatch({
    color,
    selected,
    onPress,
    accessibilityLabel,
    size = 32,
    style,
    outlineColor = color,
    children,
}: {
    color: string
    selected: boolean
    onPress: () => void
    accessibilityLabel: string
    size?: number
    style?: StyleProp<ViewStyle>
    outlineColor?: string
    children?: ReactNode
}) {
    const scale = useSharedValue(selected ? 0.86 : 1)

    useEffect(() => {
        scale.value = withSpring(selected ? 0.86 : 1, {
            damping: 20,
            stiffness: 230,
            mass: 0.7,
            reduceMotion: ReduceMotion.System,
        })
    }, [scale, selected])

    const centerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ selected }}
            onPress={onPress}
            style={[
                size > 0 ? { width: size, height: size } : null,
                style,
                styles.outer,
                selected && { borderWidth: 2, borderColor: outlineColor },
            ]}
        >
            <Animated.View
                style={[
                    styles.center,
                    { width: '100%', height: '100%', backgroundColor: color },
                    centerStyle,
                ]}
            >
                {children}
            </Animated.View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    outer: {
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
