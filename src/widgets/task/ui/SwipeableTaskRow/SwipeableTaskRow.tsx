import { t, useLanguage } from '@/shared/lib/i18n'
import { useCallback, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Swipeable, {
    type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { useSwipeableRowsCoordinator } from '@/shared/lib/swipeable-rows-coordinator'
import { Icon } from '@/shared/ui/Icon'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { TheText } from '@/shared/ui/TheText'

import type { SwipeableTaskRowProps } from './model'

/** Leading swipe action completes a task; trailing actions edit or delete it. */
export function SwipeableTaskRow({
    taskId,
    instanceKey = taskId,
    isCompleted,
    onComplete,
    onDelete,
    onEdit,
    children,
}: SwipeableTaskRowProps) {
    const language = useLanguage()

    const swipeable = useRef<SwipeableMethods>(null)
    const [rowWidth, setRowWidth] = useState(0)
    const [actionSide, setActionSide] = useState<'left' | 'right'>('right')
    const [confirmDelete, setConfirmDelete] = useState(false)
    const red = useThemeColor('accent-red')
    const green = useThemeColor('accent-green')
    const brand = useThemeColor('brand')
    const { colors } = useTheme()
    const coordinator = useSwipeableRowsCoordinator()

    const handleSwipeableRef = useCallback(
        (instance: SwipeableMethods | null) => {
            // Recompute localized values when the app language changes.
            void language

            swipeable.current = instance
            coordinator?.register(instanceKey, instance)
        },
        [language, coordinator, instanceKey],
    )
    const notifyOpening = useCallback(() => {
        void language
        return coordinator?.notifyWillOpen(instanceKey)
    }, [language, coordinator, instanceKey])

    function submitDelete() {
        swipeable.current?.close()
        setConfirmDelete(true)
    }

    function submitComplete() {
        if (isCompleted) return
        swipeable.current?.close()
        onComplete()
    }

    const fullSwipe = Gesture.Pan()
        .withTestId(`swipe-task-${instanceKey}`)
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .runOnJS(true)
        .onStart(notifyOpening)
        .onUpdate((event) =>
            setActionSide(event.translationX > 0 ? 'left' : 'right'),
        )
        // Gesture Handler registers this callback; it runs only when the gesture ends.
        // eslint-disable-next-line react-hooks/refs
        .onEnd((event, success) => {
            if (
                success &&
                -event.translationX >= Math.max(160, rowWidth * 0.65)
            ) {
                submitDelete()
            } else if (
                success &&
                event.translationX >= Math.max(160, rowWidth * 0.65) &&
                !isCompleted
            ) {
                submitComplete()
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
                        testID={`swipeable-task-${instanceKey}`}
                        simultaneousWithExternalGesture={fullSwipe}
                        overshootLeft
                        overshootRight
                        overshootFriction={1}
                        onSwipeableWillOpen={notifyOpening}
                        containerStyle={{
                            backgroundColor:
                                actionSide === 'left' ? green : red,
                        }}
                        childrenContainerStyle={{
                            backgroundColor: colors.backgroundGrouped.secondary,
                        }}
                        leftThreshold={40}
                        dragOffsetFromLeftEdge={16}
                        renderLeftActions={
                            isCompleted
                                ? undefined
                                : () => (
                                      <View style={styles.actionsRow}>
                                          <Pressable
                                              accessibilityRole="button"
                                              accessibilityLabel={t(
                                                  'Отметить выполненной',
                                              )}
                                              onPress={submitComplete}
                                              style={[
                                                  styles.action,
                                                  { backgroundColor: green },
                                              ]}
                                          >
                                              <Icon
                                                  name="check-outline"
                                                  size={22}
                                                  color="gray-white"
                                              />
                                              <TheText
                                                  size="caption-1"
                                                  weight="600"
                                                  color="gray-white"
                                              >
                                                  {t('Готово')}
                                              </TheText>
                                          </Pressable>
                                      </View>
                                  )
                        }
                        rightThreshold={40}
                        dragOffsetFromRightEdge={16}
                        renderRightActions={() => (
                            <View style={styles.actionsRow}>
                                {onEdit && (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t('Изменить')}
                                        onPress={() => {
                                            swipeable.current?.close()
                                            onEdit()
                                        }}
                                        style={[
                                            styles.action,
                                            {
                                                backgroundColor: brand,
                                            },
                                        ]}
                                    >
                                        <Icon
                                            name="edit"
                                            size={22}
                                            color="gray-white"
                                        />
                                        <TheText
                                            size="caption-1"
                                            weight="600"
                                            color="gray-white"
                                        >
                                            {t('Изменить')}
                                        </TheText>
                                    </Pressable>
                                )}

                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={t('Удалить задачу')}
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
                            </View>
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
    actionsRow: {
        flexDirection: 'row',
    },
    action: {
        width: 88,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
})
