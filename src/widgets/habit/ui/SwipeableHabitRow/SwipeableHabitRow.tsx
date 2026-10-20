import { t, useLanguage } from '@/shared/lib/i18n'
import { useCallback, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Swipeable, {
    type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable'

import { useSwipeableRowsCoordinator } from '@/shared/lib/swipeable-rows-coordinator'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { Icon } from '@/shared/ui/Icon'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { TheText } from '@/shared/ui/TheText'

import type { SwipeableHabitRowProps } from './model'

/**
 * A single swipe-left-to-delete action — `HabitRow` already has its own tap
 * zones for toggling today and opening the habit, so unlike
 * `SwipeableTaskRow` there's nothing else to put here.
 */
export function SwipeableHabitRow({
    habitId,
    onDelete,
    children,
}: SwipeableHabitRowProps) {
    const language = useLanguage()

    const swipeable = useRef<SwipeableMethods>(null)
    const [rowWidth, setRowWidth] = useState(0)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const red = useThemeColor('accent-red')
    const { colors } = useTheme()
    const coordinator = useSwipeableRowsCoordinator()

    const handleSwipeableRef = useCallback(
        (instance: SwipeableMethods | null) => {
            // Recompute localized values when the app language changes.
            void language

            swipeable.current = instance
            coordinator?.register(habitId, instance)
        },
        [language, coordinator, habitId],
    )
    const notifyOpening = useCallback(() => {
        void language
        return coordinator?.notifyWillOpen(habitId)
    }, [language, coordinator, habitId])

    function submitDelete() {
        swipeable.current?.close()
        setConfirmDelete(true)
    }

    const fullSwipe = Gesture.Pan()
        .withTestId(`swipe-habit-${habitId}`)
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .runOnJS(true)
        .onStart(notifyOpening)
        // Gesture Handler registers this callback; it runs only when the gesture ends.
        // eslint-disable-next-line react-hooks/refs
        .onEnd((event, success) => {
            if (
                success &&
                -event.translationX >= Math.max(160, rowWidth * 0.65)
            ) {
                submitDelete()
            }
        })

    return (
        <>
            <GestureDetector gesture={fullSwipe}>
                <View
                    onLayout={(event) =>
                        setRowWidth(event.nativeEvent.layout.width)
                    }
                >
                    <Swipeable
                        ref={handleSwipeableRef}
                        testID={`swipeable-habit-${habitId}`}
                        simultaneousWithExternalGesture={fullSwipe}
                        overshootRight
                        overshootFriction={1}
                        onSwipeableWillOpen={notifyOpening}
                        containerStyle={{ backgroundColor: red }}
                        childrenContainerStyle={{
                            backgroundColor: colors.backgroundGrouped.secondary,
                        }}
                        rightThreshold={40}
                        dragOffsetFromRightEdge={16}
                        renderRightActions={() => (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('Удалить привычку')}
                                onPress={submitDelete}
                                style={[
                                    styles.action,
                                    { backgroundColor: red },
                                ]}
                            >
                                <Icon
                                    name="trash"
                                    size={22}
                                    color="gray-white"
                                />
                                <TheText
                                    size="caption-1"
                                    weight="600"
                                    color="gray-white"
                                >
                                    {t('Удалить')}
                                </TheText>
                            </Pressable>
                        )}
                    >
                        {children}
                    </Swipeable>
                </View>
            </GestureDetector>
            <DeleteConfirmationSheet
                visible={confirmDelete}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() => {
                    setConfirmDelete(false)
                    onDelete()
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    action: {
        width: 88,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
})
