import { dayWord, getLocale, t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useMemoryHistory } from '@/shared/lib/memory/history'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import type { Habit, HabitCompletion } from '@/shared/api'
import { toLocalDateString } from '@/shared/lib/date'
import {
    computeAllHabitsStreak,
    getHabitDayProgress,
    getHabitMonthProgress,
    isHabitDueOnDate,
} from '@/entities/habit'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { AppHeader } from '@/shared/ui/AppHeader'
import { Icon } from '@/shared/ui/Icon'
import { Placeholder } from '@/shared/ui/Placeholder'
import { TheLottie } from '@/shared/ui/TheLottie'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { useStyles } from './styles'

export function HabitStreakScreen({
    habits,
    completionsByHabitId,
    today,
    onClose,
    onToggleCompletion,
}: {
    habits: Habit[]
    completionsByHabitId: Record<string, HabitCompletion[]>
    today: string
    onClose: () => void
    onToggleCompletion: (
        habitId: string,
        date: string,
        completed: boolean,
    ) => void
}) {
    const language = useLanguage()

    const memoryHistory = useMemoryHistory()
    const { colors } = useTheme()
    const styles = useStyles()
    const [shownMonth, setShownMonth] = useState(() => {
        const date = new Date(`${today}T12:00:00`)
        return new Date(date.getFullYear(), date.getMonth(), 1)
    })
    const [selectedDate, setSelectedDate] = useState(today)
    const streak = computeAllHabitsStreak(habits, completionsByHabitId, today)
    const days = useMemo(() => {
        void language
        return getHabitMonthProgress(
            habits,
            completionsByHabitId,
            shownMonth,
            today,
        )
    }, [language, habits, completionsByHabitId, shownMonth, today])
    const firstWeekday = (shownMonth.getDay() + 6) % 7
    const cells: ((typeof days)[number] | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...days,
    ]
    const selected = getHabitDayProgress(
        habits,
        completionsByHabitId,
        selectedDate,
    )
    const canGoForward =
        shownMonth.getFullYear() < Number(today.slice(0, 4)) ||
        (shownMonth.getFullYear() === Number(today.slice(0, 4)) &&
            shownMonth.getMonth() < Number(today.slice(5, 7)) - 1)
    const monthTitle = shownMonth.toLocaleDateString(getLocale(), {
        month: 'long',
    })
    const earliestDate = habits.reduce((earliest, habit) => {
        const date = habit.createdAt.slice(0, 10)
        return date < earliest ? date : earliest
    }, memoryHistory.firstDate ?? today)
    const canGoBack =
        shownMonth >
        new Date(
            Number(earliestDate.slice(0, 4)),
            Number(earliestDate.slice(5, 7)) - 1,
            1,
        )

    function changeMonth(direction: -1 | 1) {
        const next = new Date(
            shownMonth.getFullYear(),
            shownMonth.getMonth() + direction,
            1,
        )
        setShownMonth(next)
        setSelectedDate(
            toLocalDateString(new Date(next.getFullYear(), next.getMonth(), 1)),
        )
    }

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={
                    <TheText size="body" weight="600">
                        {t('Серия привычек')}
                    </TheText>
                }
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        view="grouped"
                        accessibilityLabel={t('Закрыть')}
                        onPress={onClose}
                    />
                }
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Section
                    paddingTop={0}
                    paddingBottom={0}
                    BottomElement={
                        <View style={styles.streakNote}>
                            <TheText size="footnote" color="labels-secondary">
                                {streak > 0
                                    ? t(
                                          'Дни, когда выполнены все привычки по расписанию',
                                      )
                                    : t(
                                          'Отмечайте все привычки дня, чтобы начать серию',
                                      )}
                            </TheText>
                        </View>
                    }
                >
                    <View style={styles.streakCard}>
                        <TheLottie
                            source={lottie.streak}
                            style={styles.streakLottie}
                            accessibilityLabel={t('Анимация серии привычек')}
                        />
                        <View style={styles.streakTextWrap}>
                            <View style={styles.streakCountRow}>
                                <TheText size="title-1" weight="700">
                                    {streak}
                                </TheText>
                            </View>
                            <TheText size="body">
                                {t('{0} подряд', [streakWord(streak)])}
                            </TheText>
                        </View>
                    </View>
                </Section>

                <Section paddingTop={0} paddingBottom={0}>
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressHeaderLabels}>
                                <TheText
                                    size="caption-1"
                                    weight="600"
                                    color="labels-secondary"
                                >
                                    {t('ПРОГРЕСС ПО ДНЯМ')}
                                </TheText>
                                <TheText
                                    size="title-3"
                                    weight="600"
                                    style={styles.monthTitle}
                                >
                                    {monthTitle}
                                </TheText>
                            </View>
                            <View style={styles.progressHeaderActions}>
                                <TheButtonIcon
                                    icon="chevron-left"
                                    size="36"
                                    view="grouped"
                                    accessibilityLabel={t('Предыдущий месяц')}
                                    isDisabled={!canGoBack}
                                    onPress={() => changeMonth(-1)}
                                />
                                <TheButtonIcon
                                    icon="chevron-right"
                                    size="36"
                                    view="grouped"
                                    accessibilityLabel={t('Следующий месяц')}
                                    isDisabled={!canGoForward}
                                    onPress={() => changeMonth(1)}
                                />
                            </View>
                        </View>
                        <View style={styles.weekdayRow}>
                            {[
                                t('Пн'),
                                t('Вт'),
                                t('Ср'),
                                t('Чт'),
                                t('Пт'),
                                t('Сб'),
                                t('Вс'),
                            ].map((day) => (
                                <View key={day} style={styles.weekdayCell}>
                                    <TheText
                                        size="caption-2"
                                        weight="600"
                                        color="labels-tertiary"
                                    >
                                        {day}
                                    </TheText>
                                </View>
                            ))}
                        </View>
                        <View style={styles.grid}>
                            {cells.map((day, index) => {
                                if (!day)
                                    return (
                                        <View
                                            key={`blank-${index}`}
                                            style={styles.blankCell}
                                        />
                                    )
                                const isSelected = day.date === selectedDate
                                const isToday = day.date === today
                                const isFuture = day.date > today
                                const hasHabits = day.total > 0
                                const background = day.isComplete
                                    ? colors.brand
                                    : day.percentage > 0
                                      ? colors.brandSecondary
                                      : colors.fill.tertiary
                                return (
                                    <Pressable
                                        key={day.date}
                                        accessibilityRole="button"
                                        accessibilityLabel={t(
                                            '{0}, выполнено {1}%',
                                            [day.date, day.percentage],
                                        )}
                                        accessibilityState={{
                                            selected: isSelected,
                                        }}
                                        disabled={isFuture}
                                        onPress={() =>
                                            setSelectedDate(day.date)
                                        }
                                        style={[
                                            styles.dayCell,
                                            { opacity: isFuture ? 0.45 : 1 },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.dayBubble,
                                                {
                                                    backgroundColor: hasHabits
                                                        ? background
                                                        : 'transparent',
                                                    borderWidth:
                                                        isSelected || isToday
                                                            ? 1.5
                                                            : 0,
                                                    borderColor: isSelected
                                                        ? colors.brand
                                                        : colors.accent.blue,
                                                },
                                            ]}
                                        >
                                            <TheText
                                                size="footnote"
                                                weight={
                                                    isSelected ||
                                                    isToday ||
                                                    day.isComplete
                                                        ? '700'
                                                        : '500'
                                                }
                                                color={
                                                    day.isComplete
                                                        ? 'gray-white'
                                                        : isToday
                                                          ? 'brand'
                                                          : hasHabits &&
                                                              day.percentage > 0
                                                            ? 'brand'
                                                            : 'labels-primary'
                                                }
                                            >
                                                {new Date(
                                                    `${day.date}T12:00:00`,
                                                ).getDate()}
                                            </TheText>
                                        </View>
                                        {hasHabits && (
                                            <View
                                                style={styles.progressBarTrack}
                                            >
                                                <View
                                                    style={[
                                                        styles.progressBarFill,
                                                        {
                                                            width: `${day.percentage}%`,
                                                            backgroundColor:
                                                                day.isComplete
                                                                    ? colors.brand
                                                                    : colors
                                                                          .accent
                                                                          .orange,
                                                        },
                                                    ]}
                                                />
                                            </View>
                                        )}
                                    </Pressable>
                                )
                            })}
                        </View>
                        <View style={styles.legendRow}>
                            <View style={styles.legendDotDone} />
                            <TheText size="caption-1" color="labels-secondary">
                                {t('Все привычки выполнены')}
                            </TheText>
                            <View style={styles.legendDotPartial} />
                            <TheText size="caption-1" color="labels-secondary">
                                {t('Есть прогресс')}
                            </TheText>
                        </View>
                    </View>
                </Section>

                <Section paddingTop={0} paddingBottom={0}>
                    <View style={styles.detailCard}>
                        <View style={styles.detailHeader}>
                            <TheText size="body" weight="600">
                                {selectedDate === today
                                    ? t('Сегодня')
                                    : new Date(
                                          `${selectedDate}T12:00:00`,
                                      ).toLocaleDateString(getLocale(), {
                                          day: 'numeric',
                                          month: 'long',
                                      })}
                            </TheText>
                            <TheText size="footnote" weight="700" color="brand">
                                {selected.percentage}%
                            </TheText>
                        </View>
                        {selected.total === 0 ? (
                            <Placeholder
                                title={t(
                                    'На этот день ничего не запланировано',
                                )}
                                description={t(
                                    'В этот день по расписанию нет привычек',
                                )}
                                style={styles.emptyPlaceholder}
                            >
                                <Icon
                                    name="calendar-days"
                                    size={32}
                                    color="labels-secondary"
                                />
                            </Placeholder>
                        ) : (
                            habits
                                .filter((habit) =>
                                    isHabitDueOnDate(habit, selectedDate),
                                )
                                .map((habit) => {
                                    const isDone =
                                        completionsByHabitId[habit.id]?.some(
                                            (item) =>
                                                item.occurrenceDate ===
                                                selectedDate,
                                        ) ?? false
                                    return (
                                        <Pressable
                                            key={habit.id}
                                            accessibilityRole="button"
                                            accessibilityLabel={
                                                isDone
                                                    ? t(
                                                          'Отметить {0} невыполненной за {1}',
                                                          [
                                                              habit.title,
                                                              selectedDate,
                                                          ],
                                                      )
                                                    : t(
                                                          'Отметить {0} выполненной за {1}',
                                                          [
                                                              habit.title,
                                                              selectedDate,
                                                          ],
                                                      )
                                            }
                                            accessibilityState={{
                                                selected: isDone,
                                            }}
                                            onPress={() =>
                                                onToggleCompletion(
                                                    habit.id,
                                                    selectedDate,
                                                    !isDone,
                                                )
                                            }
                                            style={styles.habitRow}
                                        >
                                            {isDone ? (
                                                <Icon
                                                    name="check-outline"
                                                    size={18}
                                                    color="brand"
                                                />
                                            ) : (
                                                <View
                                                    style={
                                                        styles.habitCheckboxEmpty
                                                    }
                                                />
                                            )}
                                            <TheText
                                                size="footnote"
                                                color={
                                                    isDone
                                                        ? 'labels-primary'
                                                        : 'labels-secondary'
                                                }
                                                style={
                                                    isDone
                                                        ? styles.habitLabelStrikethrough
                                                        : undefined
                                                }
                                            >
                                                {habit.title}
                                            </TheText>
                                        </Pressable>
                                    )
                                })
                        )}
                    </View>
                </Section>
            </ScrollView>
        </View>
    )
}

function streakWord(count: number) {
    return dayWord(count)
}
