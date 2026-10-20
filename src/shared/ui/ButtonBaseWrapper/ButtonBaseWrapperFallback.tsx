import { BlurView } from 'expo-blur'
import {
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from 'expo-glass-effect'
import { useEffect } from 'react'
import {
    Platform,
    Pressable,
    type PressableStateCallbackType,
    StyleSheet,
    View,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { resolveButtonColors } from './colors'
import type { ButtonBaseWrapperProps } from './model'

const BACKGROUND_TRANSITION_DURATION = 200

export function ButtonBaseWrapper({
    width = 'auto',
    height,
    children,
    variant = 'primary',
    view = 'brand',
    isLiquidGlass = false,
    isDisabled = false,
    disabledAppearance = 'muted',
    isLoading = false,
    paddingHorizontal = 16,
    style,
    accessibilityState,
    isFlex,
    ...pressableProps
}: ButtonBaseWrapperProps) {
    const theme = useTheme()
    const regularGlass = variant !== 'primary' || view === 'grouped'
    const nativeGlass =
        isLiquidGlass &&
        regularGlass &&
        Platform.OS === 'ios' &&
        isGlassEffectAPIAvailable() &&
        isLiquidGlassAvailable()
    const blocked = isDisabled || isLoading
    const colors = resolveButtonColors(
        theme,
        variant,
        view,
        isDisabled && disabledAppearance !== 'opacity',
    )
    const backgroundColor = useSharedValue(colors.backgroundColor)

    useEffect(() => {
        backgroundColor.set(
            withTiming(colors.backgroundColor, {
                duration: BACKGROUND_TRANSITION_DURATION,
            }),
        )
    }, [backgroundColor, colors.backgroundColor])

    // A dedicated absolutely-positioned layer for the animated background,
    // instead of mixing an animated style object into Pressable's function-style
    // array — that combination doesn't reliably paint on first mount, which is
    // how a plain button ends up looking like it "lost" its background/size.
    // `position: 'absolute'` keeps it out of the auto-sizing calculation below.
    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: backgroundColor.get(),
    }))

    return (
        <Pressable
            {...pressableProps}
            accessibilityRole="button"
            accessibilityState={{
                ...accessibilityState,
                disabled: blocked,
                busy: isLoading,
            }}
            disabled={blocked}
            style={(state: PressableStateCallbackType) => [
                styles.root,
                {
                    width,
                    minWidth: width === 'auto' ? undefined : width,
                    maxWidth: width === 'auto' ? undefined : width,
                    height,
                    minHeight: height,
                    maxHeight: height,
                    paddingHorizontal,
                    borderRadius: height / 2,
                    borderWidth:
                        variant === 'primary' &&
                        view !== 'grouped' &&
                        !isDisabled
                            ? 1
                            : 0,
                    borderColor:
                        theme.colorScheme === 'dark'
                            ? 'rgba(255, 255, 255, 0.28)'
                            : 'rgba(255, 255, 255, 0.38)',
                    opacity:
                        isDisabled && disabledAppearance === 'opacity'
                            ? 0.35
                            : state.pressed
                              ? 0.75
                              : 1,
                    ...(!isFlex && {
                        flexGrow: 0,
                        flexShrink: 0,
                    }),
                    ...(isFlex && {
                        flex: 1,
                    }),
                },
                typeof style === 'function' ? style(state) : style,
            ]}
        >
            {({ pressed }) => (
                <>
                    {nativeGlass ? (
                        <GlassView
                            pointerEvents="none"
                            style={StyleSheet.absoluteFill}
                            colorScheme={theme.colorScheme}
                            glassEffectStyle="regular"
                            tintColor={
                                view === 'brand'
                                    ? theme.colors.brandSecondary
                                    : undefined
                            }
                        />
                    ) : !isLiquidGlass && colors.isTertiaryFill ? (
                        <BlurView
                            pointerEvents="none"
                            intensity={15}
                            tint={theme.colorScheme}
                            blurMethod="dimezisBlurViewSdk31Plus"
                            style={[
                                StyleSheet.absoluteFill,
                                { borderRadius: height / 2 },
                            ]}
                        />
                    ) : null}
                    {!nativeGlass && (
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                StyleSheet.absoluteFill,
                                { borderRadius: height / 2 },
                                animatedBackgroundStyle,
                            ]}
                        />
                    )}
                    <View pointerEvents="none" style={styles.content}>
                        {typeof children === 'function'
                            ? children({
                                  ...colors,
                                  pressed,
                                  isDisabled: blocked,
                                  isLoading,
                                  isLiquidGlass: nativeGlass,
                              })
                            : children}
                    </View>
                </>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    root: {
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        maxWidth: '100%',
        maxHeight: '100%',
    },
})
