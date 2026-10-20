import { dayWord, t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useCallback, useEffect, useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import {
    SafeAreaInsetsContext,
    SafeAreaProvider,
} from 'react-native-safe-area-context'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedReaction,
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

type HabitCompletionCelebrationProps = {
    visible: boolean
    previousStreak: number
    streak: number
    onClose: () => void
}

export function HabitCompletionCelebration({
    visible,
    previousStreak,
    streak,
    onClose,
}: HabitCompletionCelebrationProps) {
    const language = useLanguage()

    const { colors, colorScheme } = useTheme()
    const styles = useStyles()
    const [displayedStreak, setDisplayedStreak] = useState(previousStreak)
    const overlayOpacity = useSharedValue(0)
    const cardOffset = useSharedValue(320)
    const cardScale = useSharedValue(0.92)
    const copyProgress = useSharedValue(0)
    const streakValue = useSharedValue(previousStreak)
    const centerShift = useSharedValue(0)
    const messageHeight = useSharedValue(0)

    useEffect(() => {
        if (!visible) return

        let frame = 0
        overlayOpacity.set(0)
        cardOffset.set(320)
        cardScale.set(0.92)
        copyProgress.set(0)
        streakValue.set(previousStreak)
        centerShift.set((messageHeight.get() + 24) / 2)

        frame = requestAnimationFrame(() => {
            setDisplayedStreak(previousStreak)
            overlayOpacity.set(withTiming(1, { duration: 320 }))
            cardOffset.set(
                withSpring(0, { damping: 23, stiffness: 175, mass: 1.05 }),
            )
            cardScale.set(
                withSequence(
                    withDelay(260, withTiming(1.055, { duration: 300 })),
                    withSpring(1, { damping: 13, stiffness: 190 }),
                    withDelay(160, withTiming(1.035, { duration: 220 })),
                    withSpring(1, { damping: 14, stiffness: 190 }),
                ),
            )
            streakValue.set(
                withDelay(
                    260,
                    withTiming(streak, {
                        duration: 950,
                        easing: Easing.out(Easing.cubic),
                    }),
                ),
            )
            copyProgress.set(withDelay(980, withTiming(1, { duration: 360 })))
            centerShift.set(
                withDelay(
                    980,
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
        previousStreak,
        streak,
        overlayOpacity,
        cardOffset,
        cardScale,
        copyProgress,
        streakValue,
        centerShift,
        messageHeight,
    ])

    useAnimatedReaction(
        () => Math.round(streakValue.get()),
        (current, previous) => {
            if (current !== previous) runOnJS(setDisplayedStreak)(current)
        },
    )

    const close = useCallback(() => {
        // Recompute localized values when the app language changes.
        void language

        overlayOpacity.set(withTiming(0, { duration: 240 }))
        copyProgress.set(withTiming(0, { duration: 120 }))
        cardOffset.set(
            withTiming(
                320,
                { duration: 280, easing: Easing.in(Easing.cubic) },
                (done) => {
                    if (done) runOnJS(onClose)()
                },
            ),
        )
    }, [language, overlayOpacity, copyProgress, cardOffset, onClose])

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.get(),
    }))
    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: cardOffset.get() },
            { scale: cardScale.get() },
        ],
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
                                            'Текущая серия привычек',
                                        )}
                                        style={[
                                            styles.streakBadge,
                                            {
                                                backgroundColor:
                                                    colors.backgroundGrouped
                                                        .primary,
                                            },
                                            cardStyle,
                                        ]}
                                    >
                                        <TheLottie
                                            source={lottie.streak}
                                            style={styles.streakAnimation}
                                            accessibilityLabel={t(
                                                'Анимация серии привычек',
                                            )}
                                        />
                                        <TheText
                                            size="title-1"
                                            weight="700"
                                            color="labels-primary"
                                            style={styles.streakNumber}
                                        >
                                            {displayedStreak}
                                        </TheText>
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
                                            {t('Все привычки выполнены!')}
                                        </TheText>
                                        <TheText
                                            size="body"
                                            style={styles.centerText}
                                        >
                                            {t(
                                                'Серия выросла: {0} {1} подряд. Отличная работа — продолжай в том же ритме!',
                                                [streak, dayWord(streak)],
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
