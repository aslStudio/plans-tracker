import { getLocale, t, useLanguage } from '@/shared/lib/i18n'
import { useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import type { Habit, Task } from '@/shared/api'
import type {
    CalendarEvent,
    CalendarSettings,
} from '@/shared/api/calendar/model'
import {
    agendaForDate,
    layoutEvents,
    timeLabel,
    type AgendaCompletionState,
    type AgendaItem,
} from '@/entities/calendar-event'
import { WEEKDAY_LABELS } from '@/shared/lib/calendar-grid'
import { parseLocalDateString } from '@/shared/lib/date'
import { useTheme } from '@/shared/lib/theme/use-theme'

import { useStyles } from './CalendarMultiDayTimeline.styles'

export const MULTI_DAY_HOUR_HEIGHT = 64

/**
 * Google Calendar-style 3-day/week grid — several day columns sharing one
 * hourly scroll, each laid out the same way the single-day `CalendarTimeline`
 * lays out its events. Unlike that screen, there's no drag-and-drop here:
 * a slot tap creates, an event tap opens, a header tap zooms into that day.
 */
export function CalendarMultiDayTimeline({
    dates,
    events,
    tasks,
    habits,
    completionState,
    settings,
    today,
    now,
    onOpen,
    onCreate,
    onSelectDay,
}: {
    dates: string[]
    events: CalendarEvent[]
    tasks: Task[]
    habits: Habit[]
    completionState: AgendaCompletionState
    settings: CalendarSettings
    today: string
    now: Date
    onOpen: (item: AgendaItem) => void
    onCreate: (date: string, minute: number) => void
    onSelectDay: (date: string, x: number, y: number) => void
}) {
    const language = useLanguage()

    const { colors, colorScheme } = useTheme()
    const gridColor = colorScheme === 'dark' ? '#505057' : '#CED2DA'
    const halfHourColor = colorScheme === 'dark' ? '#38383F' : '#E0E3E9'
    const styles = useStyles()
    const scrollRef = useRef<ScrollView>(null)
    const positionedInitially = useRef(false)
    const [startingOffset] = useState(() =>
        Math.max(
            0,
            (now.getHours() + now.getMinutes() / 60 - 1) *
                MULTI_DAY_HOUR_HEIGHT,
        ),
    )
    const [gridWidth, setGridWidth] = useState(0)
    const columnWidth = gridWidth > 0 ? gridWidth / dates.length : 0

    const itemsByDate = useMemo(() => {
        void language
        return dates.map((date) =>
            agendaForDate(
                events,
                tasks,
                habits,
                date,
                settings.showTasks,
                settings.showHabits,
                completionState,
            ),
        )
    }, [language, dates, events, tasks, habits, settings, completionState])

    return (
        <View style={styles.root}>
            <View style={styles.headerRow}>
                <View style={styles.gutter} />
                {dates.map((date, index) => {
                    const parsed = parseLocalDateString(date)
                    const isToday = date === today
                    return (
                        <Pressable
                            key={date}
                            accessibilityRole="button"
                            accessibilityLabel={parsed.toLocaleDateString(
                                getLocale(),
                            )}
                            onPress={() =>
                                onSelectDay(
                                    date,
                                    (index + 0.5) / dates.length - 0.5,
                                    -0.4,
                                )
                            }
                            style={[
                                styles.headerCell,
                                {
                                    backgroundColor: isToday
                                        ? colors.brand
                                        : 'transparent',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.headerWeekday,
                                    {
                                        color: isToday
                                            ? colors.gray.white
                                            : colors.labels.secondary,
                                    },
                                ]}
                            >
                                {WEEKDAY_LABELS[(parsed.getDay() + 6) % 7]}
                            </Text>
                            <Text
                                style={[
                                    styles.headerDay,
                                    {
                                        color: isToday
                                            ? colors.gray.white
                                            : colors.labels.primary,
                                    },
                                ]}
                            >
                                {parsed.getDate()}
                            </Text>
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            itemsByDate[index].length > 0
                                                ? isToday
                                                    ? colors.gray.white
                                                    : colors.brand
                                                : 'transparent',
                                    },
                                ]}
                            />
                        </Pressable>
                    )
                })}
            </View>
            {itemsByDate.some((items) => items.some((item) => item.allDay)) && (
                <View style={styles.allDayRow}>
                    <View style={styles.gutter} />
                    {itemsByDate.map((items, index) => (
                        <View key={dates[index]} style={styles.allDayColumn}>
                            {items
                                .filter((item) => item.allDay)
                                .map((item) => (
                                    <Pressable
                                        key={`${item.source}:${item.id}`}
                                        accessibilityRole="button"
                                        accessibilityLabel={t(
                                            '{0}, весь день',
                                            [item.title],
                                        )}
                                        onPress={() => onOpen(item)}
                                        style={[
                                            styles.allDayChip,
                                            { backgroundColor: item.color },
                                        ]}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.allDayChipText,
                                                { color: colors.gray.white },
                                            ]}
                                        >
                                            {item.title}
                                        </Text>
                                    </Pressable>
                                ))}
                        </View>
                    ))}
                </View>
            )}
            <ScrollView
                ref={scrollRef}
                contentOffset={{ x: 0, y: startingOffset }}
                onContentSizeChange={() => {
                    if (positionedInitially.current) return
                    positionedInitially.current = true
                    scrollRef.current?.scrollTo({
                        y: startingOffset,
                        animated: false,
                    })
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View
                    style={styles.grid}
                    onLayout={(e) =>
                        setGridWidth(
                            e.nativeEvent.layout.width - styles.gutter.width,
                        )
                    }
                >
                    {Array.from({ length: 24 }, (_, h) => (
                        <View
                            key={h}
                            style={[
                                styles.hourLine,
                                {
                                    top: h * MULTI_DAY_HOUR_HEIGHT,
                                    borderColor: gridColor,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.hourLabel,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {String(h).padStart(2, '0')}
                            </Text>
                        </View>
                    ))}
                    <View style={styles.gutter} />
                    {dates.map((date, index) => {
                        const timed = itemsByDate[index].filter(
                            (item) => !item.allDay,
                        )
                        const positioned = layoutEvents(timed)
                        const isToday = date === today
                        return (
                            <View
                                key={date}
                                style={[
                                    styles.column,
                                    {
                                        backgroundColor: isToday
                                            ? colors.brandSecondary
                                            : 'transparent',
                                    },
                                ]}
                            >
                                {Array.from({ length: 48 }, (_, half) => (
                                    <Pressable
                                        key={half}
                                        accessibilityRole="button"
                                        accessibilityLabel={t(
                                            'Добавить событие, {0}',
                                            [date],
                                        )}
                                        onPress={() =>
                                            onCreate(date, half * 30)
                                        }
                                        style={[
                                            styles.slot,
                                            {
                                                borderBottomWidth:
                                                    half % 2 === 0 ? 1 : 0,
                                                borderBottomColor:
                                                    halfHourColor,
                                            },
                                        ]}
                                    />
                                ))}
                                {positioned.map(
                                    ({ event, column, columns }) => (
                                        <Pressable
                                            key={`${event.source}:${event.id}`}
                                            accessibilityRole="button"
                                            accessibilityLabel={`${event.title}`}
                                            onPress={() => onOpen(event)}
                                            style={[
                                                styles.event,
                                                {
                                                    top:
                                                        (event.startMinute /
                                                            60) *
                                                        MULTI_DAY_HOUR_HEIGHT,
                                                    height: Math.max(
                                                        16,
                                                        (event.duration / 60) *
                                                            MULTI_DAY_HOUR_HEIGHT -
                                                            2,
                                                    ),
                                                    left:
                                                        (column * columnWidth) /
                                                            columns +
                                                        2,
                                                    width:
                                                        columnWidth / columns -
                                                        5,
                                                    backgroundColor:
                                                        colors.background
                                                            .elevated,
                                                    borderLeftColor:
                                                        event.color,
                                                    opacity: event.completed
                                                        ? 0.48
                                                        : 0.94,
                                                },
                                            ]}
                                        >
                                            <Text
                                                numberOfLines={2}
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
                                                {event.title}
                                            </Text>
                                            {dates.length === 3 &&
                                                event.duration >= 60 && (
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.eventTime,
                                                            {
                                                                color: colors
                                                                    .labels
                                                                    .secondary,
                                                            },
                                                        ]}
                                                    >
                                                        {timeLabel(
                                                            event.startMinute,
                                                        )}
                                                    </Text>
                                                )}
                                        </Pressable>
                                    ),
                                )}
                                {isToday && (
                                    <View
                                        pointerEvents="none"
                                        style={[
                                            styles.nowLine,
                                            {
                                                top:
                                                    ((now.getHours() * 60 +
                                                        now.getMinutes()) /
                                                        60) *
                                                    MULTI_DAY_HOUR_HEIGHT,
                                                backgroundColor:
                                                    colors.accent.red,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.nowDot,
                                                {
                                                    backgroundColor:
                                                        colors.accent.red,
                                                },
                                            ]}
                                        />
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </View>
            </ScrollView>
        </View>
    )
}
