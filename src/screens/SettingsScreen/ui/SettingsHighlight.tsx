import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type PropsWithChildren,
    type RefObject,
} from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/lib/theme/use-theme'

export const SettingsHighlightContext = createContext<{
    target?: string
    scroll: RefObject<ScrollView | null>
    content: RefObject<View | null>
    top: number
} | null>(null)

export function SettingsHighlight({
    id,
    children,
}: PropsWithChildren<{ id: string }>) {
    const context = useContext(SettingsHighlightContext)
    const ref = useRef<View>(null)
    const [laidOut, setLaidOut] = useState(false)
    const [visible, setVisible] = useState(false)
    const opacity = useSharedValue(0)
    const reducedMotion = useReducedMotion()
    const { colors } = useTheme()
    const active = context?.target === id
    const scroll = context?.scroll
    const content = context?.content
    const top = context?.top ?? 0
    useEffect(() => {
        if (!active || !laidOut) return
        const timer = setTimeout(() => {
            if (!content?.current) return
            ref.current?.measureLayout(
                content.current,
                (_x, y) => {
                    scroll?.current?.scrollTo({
                        y: Math.max(0, y - top - 24),
                        animated: !reducedMotion,
                    })
                    setVisible(true)
                },
                () => {},
            )
        }, 450)
        return () => clearTimeout(timer)
    }, [active, laidOut, content, scroll, top, reducedMotion])
    useEffect(() => {
        if (!visible) return
        opacity.value = reducedMotion
            ? 0.25
            : withRepeat(withTiming(0.25, { duration: 750 }), 6, true)
        const timer = setTimeout(() => setVisible(false), 4800)
        return () => {
            clearTimeout(timer)
            cancelAnimation(opacity)
            opacity.value = 0
        }
    }, [visible, reducedMotion, opacity])
    const animation = useAnimatedStyle(() => ({ opacity: opacity.value }))
    return (
        <View ref={ref} collapsable={false} onLayout={() => setLaidOut(true)}>
            {children}
            {active && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.highlight,
                        {
                            backgroundColor: colors.brand,
                            borderColor: colors.brand,
                        },
                        animation,
                    ]}
                />
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    highlight: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderWidth: 2,
        borderRadius: 14,
    },
})
