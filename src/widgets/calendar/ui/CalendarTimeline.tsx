import { t, useLanguage } from '@/shared/lib/i18n'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
    type SharedValue,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated'
import {
    layoutEvents,
    timeLabel,
    type AgendaItem,
} from '@/entities/calendar-event'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useStyles } from './CalendarTimeline.styles'

export const HOUR_HEIGHT = 76
export function CalendarTimeline({
    items,
    date,
    today,
    now,
    initialOffset,
    viewportRef,
    scrollRef,
    dragging,
    dropMinute,
    onOffset,
    onMeasure,
    onOpen,
    onCreate,
}: {
    items: AgendaItem[]
    date: string
    today: string
    now: Date
    initialOffset: number
    viewportRef: RefObject<View | null>
    scrollRef: RefObject<ScrollView | null>
    dragging: boolean
    dropMinute: number | null
    onOffset: (offset: number) => void
    onMeasure: () => void
    onOpen: (item: AgendaItem) => void
    onCreate: (minute: number) => void
}) {
    useLanguage()

    const { colors, colorScheme } = useTheme()
    const gridColor = colorScheme === 'dark' ? '#505057' : '#CED2DA'
    const halfHourColor = colorScheme === 'dark' ? '#38383F' : '#E0E3E9'
    const styles = useStyles()
    const [width, setWidth] = useState(300)
    const positionedInitially = useRef(false)
    const [startingOffset] = useState(initialOffset)
    const offset = useSharedValue(startingOffset)
    useEffect(() => {
        onOffset(startingOffset)
    }, [startingOffset, onOffset])
    const positioned = layoutEvents(items)
    return (
        <View
            testID="calendar-timeline-viewport"
            ref={viewportRef}
            collapsable={false}
            onLayout={onMeasure}
            style={styles.viewport}
        >
            <ScrollView
                ref={scrollRef}
                onContentSizeChange={() => {
                    if (positionedInitially.current) return
                    positionedInitially.current = true
                    scrollRef.current?.scrollTo({
                        y: startingOffset,
                        animated: false,
                    })
                }}
                scrollEnabled={!dragging}
                contentOffset={{ x: 0, y: startingOffset }}
                onScroll={(e) => {
                    const next = e.nativeEvent.contentOffset.y
                    offset.set(next)
                    onOffset(next)
                }}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.canvas}>
                    {Array.from({ length: 24 }, (_, h) => (
                        <View
                            key={h}
                            style={[
                                styles.hour,
                                { top: h * HOUR_HEIGHT, height: HOUR_HEIGHT },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.hourLabel,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {String(h).padStart(2, '0')}:00
                            </Text>
                            <View
                                style={[
                                    styles.hourSlot,
                                    { borderColor: gridColor },
                                ]}
                            >
                                {[0, 30].map((minute) => (
                                    <Pressable
                                        key={minute}
                                        accessibilityRole="button"
                                        accessibilityLabel={t(
                                            'Добавить событие в {0}',
                                            [timeLabel(h * 60 + minute)],
                                        )}
                                        onPress={() =>
                                            onCreate(h * 60 + minute)
                                        }
                                        style={[
                                            styles.halfHourSlot,
                                            {
                                                borderBottomWidth:
                                                    minute === 0 ? 1 : 0,
                                                borderColor: halfHourColor,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                    <View
                        pointerEvents="box-none"
                        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
                        style={styles.events}
                    >
                        {positioned.map(({ event, column, columns }) => (
                            <Pressable
                                key={`${event.source}:${event.id}`}
                                accessibilityRole="button"
                                accessibilityLabel={`${event.completed ? '' + t('Выполнено:') + ' ' : ''}${
                                    event.allDay
                                        ? t('{0}, весь день', [event.title])
                                        : t('{0}, {1}, {2} минут', [
                                              event.title,
                                              timeLabel(event.startMinute),
                                              event.duration,
                                          ])
                                }`}
                                onPress={() => onOpen(event)}
                                style={({ pressed }) => [
                                    styles.event,
                                    {
                                        top:
                                            (event.startMinute / 60) *
                                            HOUR_HEIGHT,
                                        height: Math.max(
                                            30,
                                            (event.duration / 60) *
                                                HOUR_HEIGHT -
                                                3,
                                        ),
                                        left: (column * width) / columns,
                                        width: width / columns - 5,
                                        backgroundColor:
                                            colors.background.elevated,
                                        borderLeftColor: event.color,
                                        opacity: pressed
                                            ? 0.7
                                            : event.completed
                                              ? 0.48
                                              : 0.94,
                                    },
                                ]}
                            >
                                <View
                                    pointerEvents="none"
                                    style={[
                                        StyleSheet.absoluteFill,
                                        {
                                            backgroundColor: event.color,
                                            opacity: event.allDay ? 0.07 : 0.14,
                                        },
                                    ]}
                                />
                                {event.allDay ? (
                                    <AllDayCaption
                                        item={event}
                                        offset={offset}
                                    />
                                ) : (
                                    <>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.eventTitle,
                                                {
                                                    color: colors.labels
                                                        .primary,
                                                    textDecorationLine:
                                                        event.completed
                                                            ? 'line-through'
                                                            : 'none',
                                                },
                                            ]}
                                        >
                                            {event.repeat ? '↻ ' : ''}
                                            {event.title}
                                        </Text>
                                        {event.duration >= 30 && (
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.eventTime,
                                                    {
                                                        color: colors.labels
                                                            .secondary,
                                                    },
                                                ]}
                                            >
                                                {timeLabel(event.startMinute)} –{' '}
                                                {timeLabel(
                                                    event.startMinute +
                                                        event.duration,
                                                )}
                                                {event.location
                                                    ? ` · ${event.location}`
                                                    : ''}
                                            </Text>
                                        )}
                                        {event.duration >= 60 && event.link && (
                                            <Text
                                                style={[
                                                    styles.eventLinkBadge,
                                                    { color: event.color },
                                                ]}
                                            >
                                                {event.link.type === 'task'
                                                    ? t('ЗАДАЧА')
                                                    : t('ПРИВЫЧКА')}
                                            </Text>
                                        )}
                                    </>
                                )}
                            </Pressable>
                        ))}
                    </View>
                    {date === today && (
                        <View
                            pointerEvents="none"
                            style={[
                                styles.nowLine,
                                {
                                    top:
                                        ((now.getHours() * 60 +
                                            now.getMinutes()) /
                                            60) *
                                        HOUR_HEIGHT,
                                    backgroundColor: colors.accent.red,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.nowDot,
                                    { backgroundColor: colors.accent.red },
                                ]}
                            />
                        </View>
                    )}
                    {dropMinute != null && (
                        <View
                            pointerEvents="none"
                            style={[
                                styles.drop,
                                {
                                    top: (dropMinute / 60) * HOUR_HEIGHT,
                                    backgroundColor: colors.brandSecondary,
                                    borderColor: colors.brand,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dropLabel,
                                    { color: colors.brand },
                                ]}
                            >
                                {timeLabel(dropMinute)}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}
function AllDayCaption({
    item,
    offset,
}: {
    item: AgendaItem
    offset: SharedValue<number>
}) {
    useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const sticky = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: Math.max(
                    0,
                    Math.min(HOUR_HEIGHT * 24 - 72, offset.get()),
                ),
            },
        ],
    }))
    return (
        <Animated.View style={sticky}>
            <Text
                numberOfLines={2}
                style={[
                    styles.allDayTitle,
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
                numberOfLines={1}
                style={[styles.allDaySubtitle, { color: item.color }]}
            >
                {t('Весь день')}
            </Text>
        </Animated.View>
    )
}
