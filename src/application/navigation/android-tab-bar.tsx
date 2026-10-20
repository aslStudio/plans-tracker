import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { MonoIconName } from '@/shared/config/icons'
import { hapticSelect } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'

const TAB_BAR_HORIZONTAL_PADDING = 6

/** Route name -> icon. Keep in sync with the routes declared in `(tabs)/_layout.tsx`. */
const TAB_ICONS: Record<string, MonoIconName> = {
    index: 'check-outline',
    habits: 'fire',
    planner: 'calendar-days',
}

/**
 * Floating pill tab bar used on Android — iOS gets the platform's own
 * `NativeTabs` instead (see `(tabs)/_layout.tsx`), the same split
 * plans-tracker uses.
 */
export function AndroidTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const { colors, colorScheme } = useTheme()
    const insets = useSafeAreaInsets()
    const [barWidth, setBarWidth] = useState(0)
    const indicatorX = useSharedValue(0)
    const tabCount = state.routes.length
    const slotWidth = Math.max(
        0,
        (barWidth - TAB_BAR_HORIZONTAL_PADDING * 2) / tabCount,
    )

    useEffect(() => {
        indicatorX.set(
            withSpring(state.index * slotWidth, {
                damping: 18,
                stiffness: 220,
                mass: 0.7,
            }),
        )
    }, [indicatorX, slotWidth, state.index])

    const indicatorStyle = useAnimatedStyle(() => ({
        width: slotWidth,
        transform: [{ translateX: indicatorX.get() }],
    }))

    return (
        <View
            style={[
                styles.bar,
                {
                    bottom: insets.bottom + 12,
                    backgroundColor: 'transparent',
                    borderColor:
                        colorScheme === 'dark'
                            ? 'rgba(190, 255, 246, 0.2)'
                            : 'rgba(255, 255, 255, 0.9)',
                },
            ]}
            onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        >
            <BlurView
                pointerEvents="none"
                intensity={60}
                tint={colorScheme}
                blurMethod="dimezisBlurViewSdk31Plus"
                style={StyleSheet.absoluteFill}
            />
            <View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor:
                            colorScheme === 'dark'
                                ? 'rgba(16, 37, 38, 0.72)'
                                : 'rgba(255, 255, 255, 0.72)',
                    },
                ]}
            />
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.activeBox,
                    indicatorStyle,
                    { backgroundColor: colors.accentSecondary.turquoise },
                ]}
            />
            {state.routes.map((route, index) => {
                const isFocused = state.index === index
                const icon = TAB_ICONS[route.name] ?? 'target'
                const options = descriptors[route.key]?.options
                const label =
                    typeof options?.title === 'string'
                        ? options.title
                        : route.name

                function onPress() {
                    hapticSelect()
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    })
                    if (!isFocused && !event.defaultPrevented)
                        navigation.navigate(route.name, route.params)
                }

                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="tab"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: isFocused }}
                        onPress={onPress}
                        style={styles.button}
                    >
                        <Icon
                            name={icon}
                            size={24}
                            color={isFocused ? 'brand' : 'labels-secondary'}
                        />
                    </Pressable>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 64,
        paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 32,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#123c3a',
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
    },
    activeBox: {
        position: 'absolute',
        left: TAB_BAR_HORIZONTAL_PADDING,
        height: 52,
        borderRadius: 26,
    },
    button: {
        flex: 1,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
})
