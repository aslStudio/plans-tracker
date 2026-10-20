import { t, useLanguage } from '@/shared/lib/i18n'
import { Pressable, ScrollView, Text, View } from 'react-native'
import type { Habit, Task } from '@/shared/api'
import type {
    CalendarEvent,
    CalendarSettings,
} from '@/shared/api/calendar/model'
import { buildMonthGrid, WEEKDAY_LABELS } from '@/shared/lib/calendar-grid'
import {
    agendaForDate,
    type AgendaCompletionState,
} from '@/entities/calendar-event'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useStyles } from './CalendarMonth.styles'

export function CalendarMonth({
    date,
    today,
    events,
    tasks,
    habits,
    completionState,
    settings,
    onSelect,
}: {
    date: Date
    today: string
    events: CalendarEvent[]
    tasks: Task[]
    habits: Habit[]
    completionState: AgendaCompletionState
    settings: CalendarSettings
    onSelect: (date: string, x: number, y: number) => void
}) {
    useLanguage()

    const { colors, colorScheme } = useTheme()
    const gridColor = colorScheme === 'dark' ? '#505057' : '#CED2DA'
    const styles = useStyles()
    const weeks = buildMonthGrid(date)
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.row}>
                {WEEKDAY_LABELS.map((label) => (
                    <Text
                        key={label}
                        style={[
                            styles.weekLabel,
                            { color: colors.labels.secondary },
                        ]}
                    >
                        {label}
                    </Text>
                ))}
            </View>
            {weeks.map((week, row) => (
                <View key={row} style={styles.row}>
                    {week.map((cell, i) => {
                        const items = cell
                            ? agendaForDate(
                                  events,
                                  tasks,
                                  habits,
                                  cell.date,
                                  settings.showTasks,
                                  settings.showHabits,
                                  completionState,
                              )
                            : []
                        return (
                            <Pressable
                                key={cell?.date ?? i}
                                disabled={!cell}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    cell
                                        ? t('{0}, событий: {1}', [
                                              cell.date,
                                              items.length,
                                          ])
                                        : undefined
                                }
                                onPress={() =>
                                    onSelect(
                                        cell!.date,
                                        (i + 0.5) / 7 - 0.5,
                                        (row + 0.5) / weeks.length - 0.5,
                                    )
                                }
                                style={[
                                    styles.cell,
                                    {
                                        borderColor: gridColor,
                                        backgroundColor:
                                            cell?.date === today
                                                ? colors.brandSecondary
                                                : 'transparent',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayLabel,
                                        {
                                            color:
                                                cell?.date === today
                                                    ? colors.brand
                                                    : colors.labels.primary,
                                            fontWeight:
                                                cell?.date === today
                                                    ? '800'
                                                    : '500',
                                        },
                                    ]}
                                >
                                    {cell?.day}
                                </Text>
                                {items.slice(0, 3).map((item) => (
                                    <View
                                        key={`${item.source}:${item.id}`}
                                        style={[
                                            styles.item,
                                            { borderColor: item.color },
                                        ]}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.itemTitle,
                                                {
                                                    color: colors.labels
                                                        .primary,
                                                    opacity: item.completed
                                                        ? 0.55
                                                        : 1,
                                                    textDecorationLine:
                                                        item.completed
                                                            ? 'line-through'
                                                            : 'none',
                                                },
                                            ]}
                                        >
                                            {item.title}
                                        </Text>
                                    </View>
                                ))}
                                {items.length > 3 && (
                                    <Text
                                        style={[
                                            styles.overflowLabel,
                                            { color: colors.labels.secondary },
                                        ]}
                                    >
                                        +{items.length - 3}
                                    </Text>
                                )}
                            </Pressable>
                        )
                    })}
                </View>
            ))}
        </ScrollView>
    )
}
