import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
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
import { buildTextStyle } from '@/shared/ui/TheText/styles'

import {
    heightMap,
    iconSizeMap,
    paddingMap,
    textSizeMap,
    type TheButtonProps,
} from './model'
import { useStyles } from './styles'

const AnimatedText = Animated.createAnimatedComponent(Text)
const COLOR_TRANSITION_DURATION = 200

export const TheButton: React.FC<TheButtonProps> = ({
    style,
    variant = 'primary',
    view = 'brand',
    size = '52',
    iconLeft,
    iconRight,
    iconSize,
    isLoading,
    isDisabled,
    isLiquidGlass = true,
    isWide = false,
    isFlex = false,
    children,
    onPress,
}) => {
    const styles = useStyles()
    const theme = useTheme()
    const { foregroundColor } = resolveButtonColors(
        theme,
        variant,
        view,
        isDisabled,
    )
    const loadingProgress = useSharedValue(isLoading ? 1 : 0)
    const textColor = useSharedValue(foregroundColor)

    useEffect(() => {
        loadingProgress.set(withTiming(isLoading ? 1 : 0, { duration: 220 }))
    }, [isLoading, loadingProgress])

    useEffect(() => {
        textColor.set(
            withTiming(foregroundColor, {
                duration: COLOR_TRANSITION_DURATION,
            }),
        )
    }, [foregroundColor, textColor])

    const contentAnimation = useAnimatedStyle(() => ({
        opacity: 1 - loadingProgress.get(),
    }))
    const loaderAnimation = useAnimatedStyle(() => ({
        opacity: loadingProgress.get(),
    }))
    const textAnimatedStyle = useAnimatedStyle(() => ({
        color: textColor.get(),
    }))
    const textStyle = buildTextStyle({
        weight: '600',
        size: textSizeMap[size],
        color: foregroundColor,
    })

    return (
        <ButtonBaseWrapper
            style={style}
            variant={variant}
            view={view}
            height={heightMap[size]}
            width={isWide ? '100%' : 'auto'}
            isFlex={isFlex}
            isDisabled={isDisabled}
            isLoading={isLoading}
            paddingHorizontal={paddingMap[size]}
            isLiquidGlass={isLiquidGlass}
            onPress={onPress}
        >
            <View style={styles.root}>
                <Animated.View style={contentAnimation}>
                    <View style={styles.wrapper}>
                        {iconLeft && (
                            <IconAnimated
                                name={iconLeft}
                                size={iconSize ?? iconSizeMap[size]}
                                nativeColor={foregroundColor}
                            />
                        )}
                        <AnimatedText style={[textStyle, textAnimatedStyle]}>
                            {children}
                        </AnimatedText>
                        {iconRight && (
                            <IconAnimated
                                name={iconRight}
                                size={iconSize ?? iconSizeMap[size]}
                                nativeColor={foregroundColor}
                            />
                        )}
                    </View>
                </Animated.View>
                <Animated.View style={[styles.loading, loaderAnimation]}>
                    <Loader size={iconSizeMap[size]} color={foregroundColor} />
                </Animated.View>
            </View>
        </ButtonBaseWrapper>
    )
}
