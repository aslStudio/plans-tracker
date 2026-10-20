import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { ButtonBaseWrapper } from '@/shared/ui/ButtonBaseWrapper'
import { resolveButtonColors } from '@/shared/ui/ButtonBaseWrapper/colors'
import { IconAnimated } from '@/shared/ui/Icon'
import { Loader } from '@/shared/ui/Loader'

import type { TheButtonIconProps } from './model'
import { heightMap, iconSizeMap } from './model'
import { useStyles } from './styles'

export function TheButtonIcon({
    icon,
    variant = 'primary',
    view = 'brand',
    size = '52',
    isLoading = false,
    isDisabled,
    disabledAppearance = 'muted',
    isLiquidGlass = true,
    isWide = false,
    accessibilityLabel,
    onPress,
    onPressIn,
    onPressOut,
}: TheButtonIconProps) {
    const theme = useTheme()
    const styles = useStyles()
    const progress = useSharedValue(isLoading ? 1 : 0)

    useEffect(() => {
        progress.set(withTiming(isLoading ? 1 : 0, { duration: 220 }))
    }, [isLoading, progress])

    const iconStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.get() }))
    const loaderStyle = useAnimatedStyle(() => ({ opacity: progress.get() }))
    const { foregroundColor: color } = resolveButtonColors(
        theme,
        variant,
        view,
        isDisabled && disabledAppearance !== 'opacity',
    )

    return (
        <ButtonBaseWrapper
            variant={variant}
            view={view}
            height={heightMap[size]}
            width={isWide ? '100%' : heightMap[size]}
            isDisabled={isDisabled}
            disabledAppearance={disabledAppearance}
            isLoading={isLoading}
            isLiquidGlass={isLiquidGlass}
            paddingHorizontal={0}
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
        >
            <View style={styles.fill}>
                <Animated.View style={iconStyle}>
                    <IconAnimated
                        name={icon}
                        size={iconSizeMap[size]}
                        nativeColor={color}
                    />
                </Animated.View>
                <Animated.View
                    style={[styles.loaderOverlay, loaderStyle]}
                    pointerEvents="none"
                >
                    <Loader size={iconSizeMap[size]} color={color} />
                </Animated.View>
            </View>
        </ButtonBaseWrapper>
    )
}
