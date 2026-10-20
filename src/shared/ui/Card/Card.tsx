import Animated from 'react-native-reanimated'
import { listLayout } from '@/shared/lib/motion'
import type { ReactNode } from 'react'
import {
    Platform,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native'
import { BlurView } from 'expo-blur'
import {
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from 'expo-glass-effect'
import { useTheme } from '@/shared/lib/theme/use-theme'

export type CardVariant = 'primary' | 'secondary' | 'glass'

export function Card({
    animated = false,
    children,
    variant = 'secondary',
    style,
}: {
    animated?: boolean
    children: ReactNode
    variant?: CardVariant
    style?: StyleProp<ViewStyle>
}) {
    const { colors, colorScheme } = useTheme()
    const nativeGlass =
        variant === 'glass' &&
        Platform.OS === 'ios' &&
        isGlassEffectAPIAvailable() &&
        isLiquidGlassAvailable()
    return (
        <Animated.View
            layout={animated ? listLayout : undefined}
            style={[
                {
                    backgroundColor:
                        variant === 'glass'
                            ? 'transparent'
                            : variant === 'secondary'
                              ? colors.backgroundGrouped.secondary
                              : colors.background.elevated,
                    borderRadius: variant === 'glass' ? 28 : 24,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor:
                        variant === 'glass'
                            ? colorScheme === 'dark'
                                ? 'rgba(190, 255, 246, 0.2)'
                                : 'rgba(255, 255, 255, 0.9)'
                            : colors.separator.opaque,
                },
                style,
            ]}
        >
            {variant === 'glass' &&
                (nativeGlass ? (
                    <GlassView
                        pointerEvents="none"
                        style={StyleSheet.absoluteFill}
                        glassEffectStyle="regular"
                        colorScheme={colorScheme}
                        tintColor={colors.brandSecondary}
                    />
                ) : (
                    <>
                        <BlurView
                            pointerEvents="none"
                            intensity={50}
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
                                            ? 'rgba(17, 39, 40, 0.72)'
                                            : 'rgba(255, 255, 255, 0.72)',
                                },
                            ]}
                        />
                    </>
                ))}
            {children}
        </Animated.View>
    )
}
