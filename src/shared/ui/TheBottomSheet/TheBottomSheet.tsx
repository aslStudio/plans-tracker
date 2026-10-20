import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { t } from '@/shared/lib/i18n'

export type TheBottomSheetProps = {
    visible: boolean
    /** Backdrop tap, Android back button, and `Modal`'s own close request all route here. */
    onClose: () => void
    /** Receives `dismiss` so a given action (save, confirm-delete, …) can play the
     * exit animation before running its own follow-up, instead of closing instantly. */
    children: (dismiss: (afterClose: () => void) => void) => ReactNode
}

/**
 * The blurred, spring-in/timing-out bottom sheet shared by every modal in the
 * app (explanations, delete confirmations, entity editors) — `Modal` + blur
 * backdrop + rounded top corners that survive the keyboard's rounded corners
 * + a `dismiss(afterClose)` that always finishes animating out before its
 * caller unmounts or reacts. Callers own their own content and transitions
 * between content (see `EntityEditorSheet`) instead of stacking a second
 * `Modal` on top of this one.
 */
export function TheBottomSheet({
    visible,
    onClose,
    children,
}: TheBottomSheetProps) {
    const { colors, colorScheme } = useTheme()
    const sheetHeight = useRef(0)
    const isClosing = useRef(false)
    const overlayOpacity = useSharedValue(0)
    const sheetOffset = useSharedValue(480)

    useEffect(() => {
        const hiddenOffset =
            sheetHeight.current > 0 ? sheetHeight.current + 48 : 480
        isClosing.current = false
        overlayOpacity.set(0)
        sheetOffset.set(hiddenOffset)
        if (!visible) return

        requestAnimationFrame(() => {
            overlayOpacity.set(withTiming(1, { duration: 220 }))
            sheetOffset.set(
                withSpring(0, { damping: 24, stiffness: 210, mass: 0.9 }),
            )
        })
    }, [visible, overlayOpacity, sheetOffset])

    const dismiss = useCallback(
        (afterClose: () => void) => {
            if (isClosing.current) return
            isClosing.current = true
            overlayOpacity.set(withTiming(0, { duration: 180 }))
            sheetOffset.set(
                withTiming(
                    sheetHeight.current + 48,
                    { duration: 230 },
                    (finished) => {
                        if (finished) runOnJS(afterClose)()
                    },
                ),
            )
        },
        [overlayOpacity, sheetOffset],
    )

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.get(),
    }))
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetOffset.get() }],
    }))

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={() => dismiss(onClose)}
            presentationStyle="overFullScreen"
            navigationBarTranslucent
            statusBarTranslucent
        >
            <SafeAreaProvider>
                <Animated.View style={[styles.backdrop, overlayStyle]}>
                    <BlurView
                        pointerEvents="none"
                        intensity={24}
                        tint={colorScheme === 'dark' ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('Закрыть окно')}
                        style={StyleSheet.absoluteFill}
                        onPress={() => dismiss(onClose)}
                    >
                        <View pointerEvents="none" style={styles.scrim} />
                    </Pressable>
                    <Animated.View style={sheetStyle}>
                        <KeyboardAvoidingView
                            behavior={
                                Platform.OS === 'ios' ? 'padding' : undefined
                            }
                            style={[
                                styles.keyboardFiller,
                                { backgroundColor: colors.background.elevated },
                            ]}
                        >
                            <Animated.View
                                onLayout={(event) => {
                                    sheetHeight.current =
                                        event.nativeEvent.layout.height
                                }}
                                style={[
                                    styles.sheet,
                                    {
                                        backgroundColor:
                                            colors.background.elevated,
                                    },
                                ]}
                            >
                                <SafeAreaView
                                    edges={['bottom']}
                                    style={styles.safeContent}
                                >
                                    {
                                        // dismiss is only ever invoked from the caller's own event handlers, never during its render.
                                        // eslint-disable-next-line react-hooks/refs
                                        children(dismiss)
                                    }
                                </SafeAreaView>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </Animated.View>
            </SafeAreaProvider>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    scrim: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.22)',
    },
    keyboardFiller: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    safeContent: { paddingBottom: 16, gap: 20 },
    sheet: {
        paddingTop: 24,
        paddingHorizontal: 20,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
})
