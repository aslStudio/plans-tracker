import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
    subscribeToAppToast,
    type AppToastMessage,
} from '@/shared/lib/toast/app-toast'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'

const TOAST_DURATION = 1600

export function AppToastHost() {
    const language = useLanguage()

    const { colors } = useTheme()
    const insets = useSafeAreaInsets()
    const [message, setMessage] = useState<AppToastMessage | null>(null)
    const opacity = useSharedValue(0)
    const offsetY = useSharedValue(-150)
    const scale = useSharedValue(0.94)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const animationFrame = useRef<number | null>(null)

    const hide = useCallback(() => {
        // Recompute localized values when the app language changes.
        void language

        if (timer.current) {
            clearTimeout(timer.current)
            timer.current = null
        }
        opacity.set(withTiming(0, { duration: 220 }))
        offsetY.set(
            withTiming(-32, { duration: 260, easing: Easing.in(Easing.cubic) }),
        )
        scale.set(withTiming(0.97, { duration: 220 }))
        // Dropping `message` once the hide animation finishes closes the
        // native Modal below — leaving it open would steal the "topmost
        // presented controller" slot from the next route-level modal that
        // gets presented (e.g. opening another task), making THAT modal
        // appear underneath this one instead of on top.
        setTimeout(() => setMessage(null), 260)
    }, [language, opacity, offsetY, scale])

    useEffect(() => {
        const unsubscribe = subscribeToAppToast((nextMessage) => {
            if (timer.current) clearTimeout(timer.current)
            if (animationFrame.current != null)
                cancelAnimationFrame(animationFrame.current)
            setMessage(nextMessage)
            opacity.set(0)
            offsetY.set(-150)
            scale.set(0.94)
            animationFrame.current = requestAnimationFrame(() => {
                opacity.set(withTiming(1, { duration: 260 }))
                offsetY.set(
                    withSpring(0, { damping: 19, stiffness: 175, mass: 0.9 }),
                )
                scale.set(withSpring(1, { damping: 17, stiffness: 190 }))
            })
            timer.current = setTimeout(hide, TOAST_DURATION)
        })

        return () => {
            unsubscribe()
            if (timer.current) clearTimeout(timer.current)
            if (animationFrame.current != null)
                cancelAnimationFrame(animationFrame.current)
        }
    }, [hide, opacity, offsetY, scale])

    const toastStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
        transform: [{ translateY: offsetY.get() }, { scale: scale.get() }],
    }))

    return (
        <Modal
            transparent
            visible={message !== null}
            animationType="none"
            statusBarTranslucent
            onRequestClose={hide}
        >
            <View pointerEvents="box-none" style={styles.host}>
                {message && (
                    <Animated.View
                        accessibilityRole="alert"
                        accessibilityLiveRegion="polite"
                        style={[
                            styles.toast,
                            {
                                top: insets.top + 10,
                                backgroundColor: colors.background.elevated,
                                borderColor: colors.fill.tertiary,
                            },
                            toastStyle,
                        ]}
                    >
                        <Pressable
                            onPress={hide}
                            accessibilityRole="button"
                            accessibilityLabel={t('Закрыть уведомление')}
                            style={styles.pressable}
                        >
                            <View
                                accessible
                                accessibilityRole="image"
                                accessibilityLabel={
                                    message.animation === 'done'
                                        ? t('Удалено')
                                        : message.animation === 'warning'
                                          ? t('Внимание')
                                          : t('Добавлено')
                                }
                                style={styles.animationSurface}
                            >
                                <TheLottie
                                    source={
                                        message.animation === 'done'
                                            ? lottie.done
                                            : message.animation === 'warning'
                                              ? lottie.warning
                                              : lottie.plus
                                    }
                                    style={styles.animation}
                                />
                            </View>
                            <View style={styles.copy}>
                                <TheText size="subheadline" weight="700">
                                    {message.title}
                                </TheText>
                                <TheText
                                    size="footnote"
                                    color="labels-secondary"
                                >
                                    {message.description}
                                </TheText>
                            </View>
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    host: {
        ...StyleSheet.absoluteFill,
        zIndex: 10000,
        alignItems: 'center',
    },
    toast: {
        position: 'absolute',
        left: 16,
        right: 16,
        maxWidth: 420,
        minHeight: 76,
        borderRadius: 24,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 16,
    },
    pressable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },
    animationSurface: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    animation: {
        width: 42,
        height: 42,
    },
    copy: {
        flex: 1,
        gap: 3,
    },
})
