import { t, useLanguage } from '@/shared/lib/i18n'
import { useState } from 'react'
import { View } from 'react-native'

import {
    addMonths,
    buildMonthGrid,
    formatMonthLabel,
    WEEKDAY_LABELS,
} from '@/shared/lib/calendar-grid'
import {
    computeCurrentStreak,
    computeMonthCompletionRate,
    resolveHabitDayState,
} from '@/entities/habit'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'

import type { HabitMonthProgressProps } from './model'
import { useStyles } from './styles'

function currentMonthStart(dateString: string): Date {
    const [year, month] = dateString.split('-').map(Number)
    return new Date(year, month - 1, 1)
}

/** A single-month calendar of done/missed days plus the month's completion rate and the current streak — the habit's own "progress in a month" chart, shown once there's an existing habit (and history) to chart. */
export function HabitMonthProgress({
    habit,
    completions,
    today,
}: HabitMonthProgressProps) {
    useLanguage()

    const styles = useStyles()
    const { colors } = useTheme()
    const thisMonth = currentMonthStart(today)
    const [monthDate, setMonthDate] = useState(thisMonth)

    const rows = buildMonthGrid(monthDate)
    const rate = computeMonthCompletionRate(
        habit,
        completions,
        monthDate,
        today,
    )
    const streak = computeCurrentStreak(habit, completions, today)
    const canGoForward = monthDate < thisMonth

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <TheButtonIcon
                    icon="chevron-left"
                    size="28"
                    variant="plain"
                    view="neutral"
                    accessibilityLabel={t('Предыдущий месяц')}
                    onPress={() =>
                        setMonthDate((current) => addMonths(current, -1))
                    }
                />
                <TheText size="subheadline" weight="600">
                    {formatMonthLabel(monthDate)}
                </TheText>
                <TheButtonIcon
                    icon="chevron-right"
                    size="28"
                    variant="plain"
                    view="neutral"
                    isDisabled={!canGoForward}
                    accessibilityLabel={t('Следующий месяц')}
                    onPress={() =>
                        setMonthDate((current) => addMonths(current, 1))
                    }
                />
            </View>

            <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label) => (
                    <View key={label} style={styles.weekdayCell}>
                        <TheText
                            size="caption-1"
                            weight="600"
                            color="labels-tertiary"
                        >
                            {label}
                        </TheText>
                    </View>
                ))}
            </View>

            {rows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map((cell, cellIndex) => {
                        if (!cell)
                            return (
                                <View
                                    key={`blank-${rowIndex}-${cellIndex}`}
                                    style={styles.cell}
                                />
                            )
                        const state = resolveHabitDayState(
                            habit,
                            completions,
                            cell.date,
                            today,
                        )
                        const dotStyle =
                            state === 'done'
                                ? { backgroundColor: colors.brand }
                                : state === 'missed'
                                  ? {
                                        borderWidth: 2,
                                        borderColor: colors.brand,
                                    }
                                  : null
                        const textColor =
                            state === 'done'
                                ? 'gray-white'
                                : state === 'future'
                                  ? 'labels-tertiary'
                                  : 'labels-primary'

                        return (
                            <View key={cell.date} style={styles.cell}>
                                <View style={[styles.dot, dotStyle]}>
                                    <TheText
                                        size="footnote"
                                        weight="600"
                                        color={textColor}
                                    >
                                        {cell.day}
                                    </TheText>
                                </View>
                            </View>
                        )
                    })}
                </View>
            ))}

            <View style={styles.summary}>
                <TheText size="footnote" color="labels-secondary">
                    {rate.due === 0
                        ? t('Нет данных за месяц')
                        : t('Выполнено {0} из {1}', [rate.done, rate.due])}
                </TheText>
                <TheText size="footnote" color="labels-secondary">
                    {streak > 0
                        ? t('Серия: {0} дн.', [streak])
                        : t('Серии нет')}
                </TheText>
            </View>
        </View>
    )
}
