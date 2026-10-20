import { t, useLanguage } from '@/shared/lib/i18n'
import { Button, Host, RNHostView } from '@expo/ui/swift-ui'
import {
    accessibilityHint,
    accessibilityIdentifier,
    accessibilityLabel,
    accessibilityValue,
    buttonBorderShape,
    buttonStyle,
    clipShape,
    controlSize,
    disabled,
    frame,
    onLongPressGesture,
    tint,
} from '@expo/ui/swift-ui/modifiers'
import {
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from 'expo-glass-effect'
import { useState } from 'react'
import { type LayoutChangeEvent, View } from 'react-native'

import { hapticTap } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'

import { ButtonBaseWrapper as FallbackButton } from './ButtonBaseWrapperFallback'
import { resolveButtonColors } from './colors'
import type { ButtonBaseWrapperProps } from './model'
import { useStyles } from './styles'

export function ButtonBaseWrapper(rawProps: ButtonBaseWrapperProps) {
    const props: ButtonBaseWrapperProps = rawProps.onPress
        ? {
              ...rawProps,
              onPress: () => {
                  hapticTap()
                  rawProps.onPress?.()
              },
          }
        : rawProps

    // SwiftUI hosts need a numeric width here. Full-width and flex buttons
    // stay in React Native so their parent controls the layout.
    if (
        !props.isLiquidGlass ||
        props.disabledAppearance === 'opacity' ||
        typeof props.width !== 'number' ||
        props.isFlex ||
        !isGlassEffectAPIAvailable() ||
        !isLiquidGlassAvailable()
    ) {
        return <FallbackButton {...props} />
    }
    return (
        <NativeButton
            key={`${props.variant}-${props.width}-${props.height}`}
            {...props}
        />
    )
}

function NativeButton({
    width = 'auto',
    height,
    children,
    variant = 'primary',
    view = 'brand',
    isDisabled = false,
    isLoading = false,
    paddingHorizontal = 16,
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    onLayout,
    accessibilityLabel: label,
    accessibilityHint: hint,
    testID,
    style,
}: ButtonBaseWrapperProps) {
    useLanguage()

    const theme = useTheme()
    const styles = useStyles()
    const blocked = isDisabled || isLoading
    const colors = resolveButtonColors(theme, variant, view, isDisabled)
    const [pressed, setPressed] = useState(false)
    const [parentWidth, setParentWidth] = useState<number>()
    const targetWidth =
        typeof width === 'number'
            ? width
            : width === '100%'
              ? parentWidth
              : undefined
    const circle = typeof width === 'number' && width === height

    function measureParent(event: LayoutChangeEvent) {
        if (width === '100%') setParentWidth(event.nativeEvent.layout.width)
        onLayout?.(event)
    }

    const state = {
        ...colors,
        pressed,
        isDisabled: blocked,
        isLoading,
        isLiquidGlass: true,
    }

    return (
        <View
            onLayout={measureParent}
            onTouchStart={(event) => {
                if (!blocked) {
                    setPressed(true)
                    onPressIn?.(event)
                }
            }}
            onTouchEnd={(event) => {
                setPressed(false)
                if (!blocked) onPressOut?.(event)
            }}
            onTouchCancel={(event) => {
                setPressed(false)
                if (!blocked) onPressOut?.(event)
            }}
            style={[
                styles.wrapper,
                {
                    width,
                    height,
                    minHeight: height,
                    maxHeight: height,
                },
                typeof style === 'function'
                    ? style({ pressed, hovered: false })
                    : style,
            ]}
        >
            <Host
                matchContents={{ horizontal: targetWidth === undefined }}
                style={{
                    ...styles.hostOverflow,
                    ...(targetWidth === undefined
                        ? {}
                        : { width: targetWidth }),
                    height,
                    maxHeight: height,
                }}
                colorScheme={theme.colorScheme}
            >
                <Button
                    onPress={() => {
                        if (!blocked) onPress?.()
                    }}
                    modifiers={[
                        buttonStyle(
                            variant === 'primary' && view !== 'grouped'
                                ? 'borderedProminent'
                                : 'glass',
                        ),
                        buttonBorderShape(circle ? 'circle' : 'capsule'),
                        controlSize('mini'),
                        frame({ height, width: targetWidth }),
                        clipShape(circle ? 'circle' : 'capsule'),
                        disabled(blocked),
                        ...(variant === 'primary' && view !== 'grouped'
                            ? [tint(colors.backgroundColor)]
                            : []),
                        ...(label ? [accessibilityLabel(label)] : []),
                        ...(hint ? [accessibilityHint(hint)] : []),
                        ...(testID ? [accessibilityIdentifier(testID)] : []),
                        ...(isLoading
                            ? [accessibilityValue(t('Загрузка'))]
                            : []),
                        ...(onLongPress
                            ? [
                                  onLongPressGesture(() => {
                                      if (!blocked) onLongPress()
                                  }),
                              ]
                            : []),
                    ]}
                >
                    <RNHostView matchContents>
                        <View
                            pointerEvents="none"
                            style={[
                                styles.content,
                                {
                                    width:
                                        targetWidth === undefined
                                            ? undefined
                                            : Math.max(1, targetWidth),
                                    height: Math.max(1, height - 2),
                                    paddingHorizontal: circle
                                        ? 0
                                        : paddingHorizontal,
                                },
                            ]}
                        >
                            {typeof children === 'function'
                                ? children(state)
                                : children}
                        </View>
                    </RNHostView>
                </Button>
            </Host>
        </View>
    )
}
