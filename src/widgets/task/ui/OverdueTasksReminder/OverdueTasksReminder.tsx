import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useCallback, useEffect } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheButton } from '@/shared/ui/TheButton'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'
import { useStyles } from './styles'

type OverdueTasksReminderProps = {
    visible: boolean
    onClose: () => void
}

export function OverdueTasksReminder({
    visible,
    onClose,
}: OverdueTasksReminderProps) {
    const language = useLanguage()

    const { colorScheme } = useTheme()
    const styles = useStyles()
    const insets = useSafeAreaInsets()
    const overlayOpacity = useSharedValue(0)
    const contentOffset = useSharedValue(32)
    const contentOpacity = useSharedValue(0)

    useEffect(() => {
        if (!visible) return

        overlayOpacity.set(0)
        contentOffset.set(32)
        contentOpacity.set(0)
        overlayOpacity.set(withTiming(1, { duration: 300 }))
        contentOffset.set(
            withDelay(
                80,
                withSpring(0, { damping: 22, stiffness: 170, mass: 1.05 }),
            ),
        )
        contentOpacity.set(withDelay(100, withTiming(1, { duration: 320 })))
    }, [visible, overlayOpacity, contentOffset, contentOpacity])

    const close = useCallback(() => {
        // Recompute localized values when the app language changes.
        void language

        contentOpacity.set(withTiming(0, { duration: 140 }))
        overlayOpacity.set(withTiming(0, { duration: 240 }))
        contentOffset.set(
            withTiming(
                24,
                { duration: 240, easing: Easing.in(Easing.cubic) },
                (finished) => {
                    if (finished) runOnJS(onClose)()
                },
            ),
        )
    }, [language, contentOpacity, overlayOpacity, contentOffset, onClose])

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.get(),
    }))
    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.get(),
        transform: [{ translateY: contentOffset.get() }],
    }))

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={close}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <BlurView
                    pointerEvents="none"
                    intensity={28}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <View pointerEvents="none" style={styles.scrim} />
                <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
                    <Animated.View style={[styles.messageCard, contentStyle]}>
                        <View style={styles.animationSurface}>
                            <TheLottie
                                source={lottie.warning}
                                style={styles.warningAnimation}
                                accessibilityLabel={t(
                                    'Предупреждение о просроченных задачах',
                                )}
                            />
                        </View>
                        <TheText
                            size="title-2"
                            weight="700"
                            style={styles.centerText}
                        >
                            {t('Есть просроченные задачи')}
                        </TheText>
                        <TheText size="body" style={styles.centerText}>
                            {t(
                                'Со вчерашнего дня остались невыполненные задачи. Проверьте их и решите, что делать дальше.',
                            )}
                        </TheText>
                    </Animated.View>

                    <Animated.View style={[styles.button, contentStyle]}>
                        <TheButton
                            size="52"
                            variant="primary"
                            view="brand"
                            isWide
                            onPress={close}
                        >
                            {t('Понятно')}
                        </TheButton>
                    </Animated.View>
                </View>
            </Animated.View>
        </Modal>
    )
}
