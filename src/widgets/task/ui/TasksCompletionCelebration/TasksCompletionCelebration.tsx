import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useCallback, useEffect } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import {
    SafeAreaInsetsContext,
    SafeAreaProvider,
} from 'react-native-safe-area-context'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheButton } from '@/shared/ui/TheButton'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'
import { useStyles } from './styles'

type TasksCompletionCelebrationProps = {
    visible: boolean
    onClose: () => void
}

export function TasksCompletionCelebration({
    visible,
    onClose,
}: TasksCompletionCelebrationProps) {
    const language = useLanguage()

    const { colorScheme } = useTheme()
    const styles = useStyles()
    const overlayOpacity = useSharedValue(0)
    const artOffset = useSharedValue(320)
    const artScale = useSharedValue(0.88)
    const copyProgress = useSharedValue(0)
    const centerShift = useSharedValue(0)
    const messageHeight = useSharedValue(0)

    useEffect(() => {
        if (!visible) return

        let frame = 0
        overlayOpacity.set(0)
        artOffset.set(320)
        artScale.set(0.88)
        copyProgress.set(0)
        centerShift.set((messageHeight.get() + 24) / 2)

        frame = requestAnimationFrame(() => {
            overlayOpacity.set(withTiming(1, { duration: 320 }))
            artOffset.set(
                withSpring(0, { damping: 22, stiffness: 170, mass: 1.05 }),
            )
            artScale.set(
                withSequence(
                    withDelay(240, withTiming(1.045, { duration: 320 })),
                    withSpring(1, { damping: 14, stiffness: 180 }),
                ),
            )
            copyProgress.set(withDelay(780, withTiming(1, { duration: 380 })))
            centerShift.set(
                withDelay(
                    780,
                    withTiming(0, {
                        duration: 460,
                        easing: Easing.out(Easing.cubic),
                    }),
                ),
            )
        })

        return () => cancelAnimationFrame(frame)
    }, [
        visible,
        overlayOpacity,
        artOffset,
        artScale,
        copyProgress,
        centerShift,
        messageHeight,
    ])

    const close = useCallback(() => {
        // Recompute localized values when the app language changes.
        void language

        overlayOpacity.set(withTiming(0, { duration: 240 }))
        copyProgress.set(withTiming(0, { duration: 120 }))
        artOffset.set(
            withTiming(
                320,
                { duration: 280, easing: Easing.in(Easing.cubic) },
                (finished) => {
                    if (finished) runOnJS(onClose)()
                },
            ),
        )
    }, [language, overlayOpacity, copyProgress, artOffset, onClose])

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.get(),
    }))
    const artStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: artOffset.get() }, { scale: artScale.get() }],
    }))
    const copyStyle = useAnimatedStyle(() => ({
        opacity: copyProgress.get(),
        transform: [{ translateY: (1 - copyProgress.get()) * 22 }],
    }))
    const centerStageStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: centerShift.get() }],
    }))

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={close}
            statusBarTranslucent
        >
            <SafeAreaProvider style={styles.modalSafeArea}>
                <Animated.View style={[styles.overlay, overlayStyle]}>
                    <BlurView
                        pointerEvents="none"
                        intensity={28}
                        tint={colorScheme === 'dark' ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <View pointerEvents="none" style={styles.scrim} />
                    <SafeAreaInsetsContext.Consumer>
                        {(modalInsets) => (
                            <View
                                style={[
                                    styles.content,
                                    {
                                        paddingTop:
                                            (modalInsets?.top ?? 0) + 24,
                                    },
                                ]}
                            >
                                <Animated.View
                                    style={[
                                        styles.centerStage,
                                        centerStageStyle,
                                    ]}
                                >
                                    <Animated.View
                                        accessibilityLabel={t(
                                            'Все задачи выполнены',
                                        )}
                                        style={[styles.artCard, artStyle]}
                                    >
                                        <TheLottie
                                            source={lottie.done}
                                            style={styles.doneAnimation}
                                            accessibilityLabel={t(
                                                'Анимация выполнения задач',
                                            )}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        onLayout={(event) => {
                                            const height =
                                                event.nativeEvent.layout.height
                                            messageHeight.set(height)
                                            if (copyProgress.get() === 0) {
                                                centerShift.set(
                                                    (height + 24) / 2,
                                                )
                                            }
                                        }}
                                        style={[styles.message, copyStyle]}
                                    >
                                        <TheText
                                            size="title-1"
                                            weight="700"
                                            style={styles.centerText}
                                        >
                                            {t('Все задачи выполнены!')}
                                        </TheText>
                                        <TheText
                                            size="body"
                                            style={styles.centerText}
                                        >
                                            {t(
                                                'Сегодня закрыты все задачи, включая просроченные. Отличная работа — так держать!',
                                            )}
                                        </TheText>
                                    </Animated.View>
                                </Animated.View>

                                <Animated.View
                                    style={[
                                        styles.button,
                                        {
                                            bottom:
                                                (modalInsets?.bottom ?? 0) + 8,
                                        },
                                        copyStyle,
                                    ]}
                                >
                                    <TheButton
                                        size="52"
                                        variant="primary"
                                        view="brand"
                                        isWide
                                        onPress={close}
                                    >
                                        {t('Отлично!')}
                                    </TheButton>
                                </Animated.View>
                            </View>
                        )}
                    </SafeAreaInsetsContext.Consumer>
                </Animated.View>
            </SafeAreaProvider>
        </Modal>
    )
}
