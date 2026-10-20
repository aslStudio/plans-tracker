import { t, useLanguage } from '@/shared/lib/i18n'
import { listLayout, listEnter, listExit } from '@/shared/lib/motion'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useSharedValue } from 'react-native-reanimated'
import type { AgendaItem } from '@/entities/calendar-event'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'
import { useStyles } from './UnplannedTray.styles'

export type DragHandlers = {
    onStart: (item: AgendaItem, x: number, y: number) => void
    onMove: (x: number, y: number) => void
    onEnd: (x: number, y: number) => void
    onCancel: () => void
}
export function UnplannedTray({
    items,
    dragging,
    onOpen,
    handlers,
}: {
    items: AgendaItem[]
    dragging: boolean
    onOpen: (item: AgendaItem) => void
    handlers: DragHandlers
}) {
    useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    if (!items.length) return null
    return (
        <View style={styles.tray}>
            <View style={styles.heading}>
                <Text
                    style={[
                        styles.headingLabel,
                        { color: colors.labels.secondary },
                    ]}
                >
                    {t('Не привязано к календарю')}
                </Text>
                <Icon
                    name="chevron-up-down"
                    size={15}
                    color="labels-tertiary"
                />
            </View>
            <ScrollView
                horizontal
                style={styles.horizontalScroll}
                scrollEnabled={!dragging}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cards}
            >
                {items.map((item) => (
                    <DraggableCard
                        key={`${item.source}:${item.id}`}
                        item={item}
                        onOpen={onOpen}
                        handlers={handlers}
                    />
                ))}
            </ScrollView>
        </View>
    )
}
function DraggableCard({
    item,
    onOpen,
    handlers,
}: {
    item: AgendaItem
    onOpen: (item: AgendaItem) => void
    handlers: DragHandlers
}) {
    useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const didDrag = useSharedValue(false)
    const gesture = Gesture.Pan()
        .withTestId(`unplanned-${item.source}-${item.id}`)
        .activateAfterLongPress(260)
        .runOnJS(true)
        .onBegin(() => {
            didDrag.set(false)
        })
        .onStart((e) => {
            didDrag.set(true)
            handlers.onStart(item, e.absoluteX, e.absoluteY)
        })
        .onUpdate((e) => handlers.onMove(e.absoluteX, e.absoluteY))
        .onEnd((e, success) => {
            if (success) handlers.onEnd(e.absoluteX, e.absoluteY)
        })
        .onFinalize((_, success) => {
            if (!success && didDrag.get()) handlers.onCancel()
        })
    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                layout={listLayout}
                entering={listEnter}
                exiting={listExit}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Запланировать: {0}', [item.title])}
                    accessibilityHint={t(
                        'Нажмите для выбора времени или удерживайте и перетащите в расписание',
                    )}
                    onPress={() => {
                        if (!didDrag.get()) onOpen(item)
                    }}
                    style={({ pressed }) => [
                        styles.card,
                        {
                            backgroundColor: colors.background.elevated,
                            borderColor: colors.separator.opaque,
                            opacity: item.completed ? 0.48 : pressed ? 0.65 : 1,
                        },
                    ]}
                >
                    <View
                        style={[styles.dot, { backgroundColor: item.color }]}
                    />
                    <View style={styles.cardTexts}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.cardTitle,
                                {
                                    color: colors.labels.primary,
                                    opacity: item.completed ? 0.55 : 1,
                                    textDecorationLine: item.completed
                                        ? 'line-through'
                                        : 'none',
                                },
                            ]}
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={[
                                styles.cardSubtitle,
                                { color: colors.labels.secondary },
                            ]}
                        >
                            {item.source === 'habit'
                                ? t('Привычка')
                                : t('Задача')}
                            {t('· удержать и перенести')}
                        </Text>
                    </View>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    )
}
