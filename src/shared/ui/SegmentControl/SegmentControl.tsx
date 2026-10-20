import { BlurView } from 'expo-blur'
import {
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from 'expo-glass-effect'
import { useEffect, useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { hapticSelect } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheText } from '@/shared/ui/TheText'

import { segmentControlMetrics, type SegmentControlProps } from './model'

export function SegmentControl<T extends string>({
    options,
    value,
    onChange,
    size = '32',
    maxWidth,
    style,
    testID,
    blurred = false,
}: SegmentControlProps<T>) {
    const theme = useTheme()
    const metrics = segmentControlMetrics[size]
    const [layouts, setLayouts] = useState<
        Record<string, { x: number; width: number }>
    >({})
    const selectedLayout = layouts[String(value)]

    return (
        <View
            testID={testID}
            style={[
                styles.root,
                {
                    height: metrics.height,
                    width: '100%',
                    maxWidth,
                    backgroundColor: theme.colors.fill.tertiary,
                },
                blurred && styles.rootBlurred,
                style,
            ]}
        >
            {/* A track-local frosted layer, on top of whatever's already
                blurred behind it (e.g. Toolbar's own blur) — the flat
                `fill.tertiary` tint alone is too light (12/24% opacity) to
                read as opaque over a busy/blurred backdrop by itself. */}
            {blurred && (
                <BlurView
                    pointerEvents="none"
                    intensity={80}
                    tint={theme.colorScheme}
                    blurMethod="dimezisBlurViewSdk31Plus"
                    style={StyleSheet.absoluteFill}
                />
            )}
            {selectedLayout && (
                <SelectionIndicator
                    layout={selectedLayout}
                    height={metrics.itemHeight}
                />
            )}
            {options.map((option) => {
                const selected = option.value === value
                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="tab"
                        accessibilityState={{
                            selected,
                            disabled: option.disabled,
                        }}
                        disabled={option.disabled}
                        onPress={() => {
                            if (!selected) hapticSelect()
                            onChange(option.value)
                        }}
                        onLayout={(event) => {
                            const { x, width } = event.nativeEvent.layout
                            setLayouts((current) =>
                                current[String(option.value)]?.x === x &&
                                current[String(option.value)]?.width === width
                                    ? current
                                    : {
                                          ...current,
                                          [String(option.value)]: { x, width },
                                      },
                            )
                        }}
                        style={[
                            styles.item,
                            {
                                height: metrics.itemHeight,
                                paddingVertical: metrics.itemPaddingVertical,
                                paddingHorizontal: 6,
                                backgroundColor: 'transparent',
                                opacity: option.disabled ? 0.4 : 1,
                                flex: 1,
                            },
                        ]}
                    >
                        {typeof option.label === 'string' ? (
                            <TheText size="subheadline" color="labels-primary">
                                {option.label}
                            </TheText>
                        ) : (
                            option.label
                        )}
                    </Pressable>
                )
            })}
        </View>
    )
}

function SelectionIndicator({
    layout,
    height,
}: {
    layout: { x: number; width: number }
    height: number
}) {
    const theme = useTheme()
    // Mount at the measured size: native glass must never start at zero width.
    const x = useSharedValue(layout.x)
    const width = useSharedValue(layout.width)
    useEffect(() => {
        x.set(withTiming(layout.x, { duration: 220 }))
        width.set(withTiming(layout.width, { duration: 220 }))
    }, [layout.x, layout.width, x, width])
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: x.get() }],
        width: width.get(),
    }))
    const useGlass =
        Platform.OS === 'ios' &&
        isGlassEffectAPIAvailable() &&
        isLiquidGlassAvailable()
    const style = [styles.indicator, { height }, animatedStyle]
    return useGlass ? (
        <AnimatedGlassView
            pointerEvents="none"
            style={style}
            tintColor={theme.colors.miscellaneous.segmentControl}
            glassEffectStyle="regular"
            isInteractive={true}
        />
    ) : (
        <Animated.View
            pointerEvents="none"
            style={[
                style,
                { backgroundColor: theme.colors.miscellaneous.segmentControl },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    root: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        gap: 4,
        padding: 2,
        borderRadius: 999,
    },
    // The flat `backgroundColor` case clips to the root's own rounded
    // corners for free — an absolutely-filled `BlurView` child doesn't,
    // so `blurred` needs this explicitly to keep the pill shape.
    rootBlurred: {
        overflow: 'hidden',
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        borderRadius: 999,
    },
    indicator: {
        position: 'absolute',
        top: 2,
        left: 0,
        borderRadius: 999,
        zIndex: 0,
    },
})

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView)
