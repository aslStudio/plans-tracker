import { t, getLocale, useLanguage } from '@/shared/lib/i18n'
import { Row } from '@/shared/ui/Row'
import { Icon } from '@/shared/ui/Icon'
import { NativeMenu } from '@/shared/ui/NativeMenu'
import { SectionIntro } from '@/widgets/section-intro/SectionIntro'
import { lottie } from '@/shared/config/lottie'
import { useMemoryHistory } from '@/shared/lib/memory/history'
import {
    listLayout,
    listEnter,
    listExit,
    layoutTiming,
} from '@/shared/lib/motion'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import Animated, {
    FadeInLeft,
    FadeInRight,
    ReduceMotion,
} from 'react-native-reanimated'

import { formatShortDate, todayDateString } from '@/shared/lib/date'
import {
    computeAllHabitsStreak,
    computeWeekStrip,
    getHabitDayProgress,
    isHabitDueOnDate,
} from '@/entities/habit'
import { AppHeader } from '@/shared/ui/AppHeader'
import { Placeholder } from '@/shared/ui/Placeholder'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { TheLottie } from '@/shared/ui/TheLottie'

import type { HabitsScreenProps } from './model'
import { useStyles } from './styles'
import {
    HabitCompletionCelebration,
    HabitRow,
    HabitStreakCard,
    SwipeableHabitRow,
} from '@/widgets/habit'

export function HabitsScreen({
    habits,
    categories,
    useCategories,
    completionsByHabitId,
    isLoading,
    onAddHabit,
    onOpenHabit,
    onDeleteHabit,
    onToggleCompletion,
    onOpenSettings,
    onOpenStreak,
    onOpenStatistics,
}: HabitsScreenProps) {
    useLanguage()

    const styles = useStyles()
    const today = todayDateString()
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const hasCategories = useCategories && categories.length > 0
    const activeCategory =
        hasCategories &&
        (categoryId === 'uncategorized' ||
            categories.some((c) => c.id === categoryId))
            ? categoryId
            : null
    const visibleHabits = habits.filter(
        (h) =>
            !activeCategory ||
            (activeCategory === 'uncategorized'
                ? !categories.some((c) => c.id === h.categoryId)
                : h.categoryId === activeCategory),
    )
    const memoryHistory = useMemoryHistory()
    const [selectedDate, setSelectedDate] = useState(today)
    const [selectedDayDirection, setSelectedDayDirection] = useState<1 | -1>(1)
    const [celebration, setCelebration] = useState<{
        previousStreak: number
        streak: number
    } | null>(null)
    const previousComplete = useRef<boolean | null>(null)
    const previousStreak = useRef(0)
    const pendingCompletion = useRef(false)
    const todayProgress = getHabitDayProgress(
        habits,
        completionsByHabitId,
        today,
    )
    const streak = computeAllHabitsStreak(habits, completionsByHabitId, today)

    useEffect(() => {
        if (isLoading) return

        const wasComplete = previousComplete.current
        if (wasComplete === null) {
            previousComplete.current = todayProgress.isComplete
            previousStreak.current = streak
            return
        }

        if (
            pendingCompletion.current &&
            !wasComplete &&
            todayProgress.isComplete
        ) {
            setCelebration({ previousStreak: previousStreak.current, streak })
            pendingCompletion.current = false
        }

        previousComplete.current = todayProgress.isComplete
        previousStreak.current = streak
    }, [isLoading, todayProgress.isComplete, streak])

    function toggleSelectedDate(habitId: string) {
        const isDone =
            completionsByHabitId[habitId]?.some(
                (completion) => completion.occurrenceDate === selectedDate,
            ) ?? false
        pendingCompletion.current = selectedDate === today && !isDone
        onToggleCompletion(habitId, selectedDate)
    }
    const selectedProgress = getHabitDayProgress(
        visibleHabits,
        completionsByHabitId,
        selectedDate,
    )
    const listEntering = selectedDayDirection > 0 ? FadeInRight : FadeInLeft
    function selectDate(date: string) {
        setSelectedDayDirection(date >= selectedDate ? 1 : -1)
        setSelectedDate(date)
    }
    const selectedDayLabel =
        selectedDate === today
            ? t('Сегодня')
            : new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  getLocale(),
                  {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                  },
              )

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                LeftItem={
                    <TheText size="title-1" weight="700">
                        {t('Привычки')}
                    </TheText>
                }
                RightItem={
                    <View style={styles.headerActions}>
                        <TheButtonIcon
                            icon="plus"
                            size="36"
                            accessibilityLabel={t('Добавить привычку')}
                            onPress={onAddHabit}
                        />
                        <TheButtonIcon
                            icon="gear"
                            size="36"
                            view="grouped"
                            accessibilityLabel={t('Настройки')}
                            onPress={onOpenSettings}
                        />
                    </View>
                }
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {!isLoading &&
                    (habits.length > 0 ||
                        (memoryHistory.global?.count ?? 0) > 0) && (
                        <HabitStreakCard
                            habits={habits}
                            completionsByHabitId={completionsByHabitId}
                            today={today}
                            selectedDate={selectedDate}
                            onPress={onOpenStreak}
                            onSelectDate={selectDate}
                        />
                    )}

                <Animated.View
                    key={selectedDate}
                    entering={listEntering
                        .duration(300)
                        .easing(layoutTiming.easing)
                        .reduceMotion(ReduceMotion.System)}
                    style={styles.dayTransition}
                >
                    {habits.length === 0 && !isLoading ? (
                        <SectionIntro section="habits" onCreate={onAddHabit} />
                    ) : (
                        <Section
                            animated
                            TopElement={
                                <View style={styles.dayHeader}>
                                    <TheText
                                        size="footnote"
                                        weight="600"
                                        color="labels-secondary"
                                        style={styles.dayLabelCapitalize}
                                    >
                                        {selectedDayLabel}
                                    </TheText>
                                    {hasCategories && (
                                        <NativeMenu
                                            items={[
                                                { id: null, label: t('Все') },
                                                ...categories,
                                                {
                                                    id: 'uncategorized',
                                                    label: t('Без категории'),
                                                },
                                            ].map((category) => ({
                                                key: category.id ?? 'all',
                                                label: category.label,
                                                systemImage: 'checkmark',
                                                icon: 'check-outline',
                                                isActive:
                                                    activeCategory ===
                                                    category.id,
                                                onPress: () =>
                                                    setCategoryId(category.id),
                                            }))}
                                            trigger={
                                                <TheButtonIcon
                                                    icon="filter"
                                                    size="28"
                                                    variant="plain"
                                                    view={
                                                        activeCategory
                                                            ? 'brand'
                                                            : 'neutral'
                                                    }
                                                    accessibilityLabel={t(
                                                        'Фильтр по категориям',
                                                    )}
                                                    onPress={() => {}}
                                                />
                                            }
                                        />
                                    )}
                                </View>
                            }
                        >
                            {selectedProgress.total === 0 && !isLoading ? (
                                <Placeholder
                                    title={
                                        activeCategory
                                            ? t('Нет привычек с этим фильтром')
                                            : t(
                                                  'На этот день ничего не запланировано',
                                              )
                                    }
                                    description={t(
                                        'В этот день по расписанию нет привычек',
                                    )}
                                >
                                    <TheLottie
                                        source={lottie.calendar}
                                        style={styles.emptyLottie}
                                    />
                                </Placeholder>
                            ) : (
                                visibleHabits.map((habit, index) => {
                                    const category = useCategories
                                        ? categories.find(
                                              (c) => c.id === habit.categoryId,
                                          )
                                        : undefined
                                    const completions =
                                        completionsByHabitId[habit.id] ?? []
                                    const weekStrip = computeWeekStrip(
                                        habit,
                                        completions,
                                        selectedDate,
                                    )
                                    const selectedState = weekStrip.find(
                                        (day) => day.date === selectedDate,
                                    )?.state

                                    return (
                                        <Animated.View
                                            key={habit.id}
                                            layout={listLayout}
                                            entering={listEnter}
                                            exiting={listExit}
                                        >
                                            {index > 0 && (
                                                <Separator offsetLeft={16} />
                                            )}
                                            <SwipeableHabitRow
                                                habitId={habit.id}
                                                onDelete={() =>
                                                    onDeleteHabit(habit.id)
                                                }
                                            >
                                                <HabitRow
                                                    habit={habit}
                                                    category={category}
                                                    isDue={isHabitDueOnDate(
                                                        habit,
                                                        selectedDate,
                                                    )}
                                                    isCompleted={
                                                        selectedState === 'done'
                                                    }
                                                    completionActionLabel={
                                                        selectedState === 'done'
                                                            ? t(
                                                                  'Отметить невыполненной {0}',
                                                                  [
                                                                      selectedDate ===
                                                                      today
                                                                          ? t(
                                                                                'сегодня',
                                                                            )
                                                                          : formatShortDate(
                                                                                selectedDate,
                                                                            ),
                                                                  ],
                                                              )
                                                            : t(
                                                                  'Отметить выполненной {0}',
                                                                  [
                                                                      selectedDate ===
                                                                      today
                                                                          ? t(
                                                                                'сегодня',
                                                                            )
                                                                          : formatShortDate(
                                                                                selectedDate,
                                                                            ),
                                                                  ],
                                                              )
                                                    }
                                                    weekStrip={weekStrip}
                                                    onToggle={() =>
                                                        toggleSelectedDate(
                                                            habit.id,
                                                        )
                                                    }
                                                    onPress={() =>
                                                        onOpenHabit(habit.id)
                                                    }
                                                />
                                            </SwipeableHabitRow>
                                        </Animated.View>
                                    )
                                })
                            )}
                        </Section>
                    )}
                </Animated.View>
                {!isLoading && onOpenStatistics && (
                    <Section paddingTop={0}>
                        <Row
                            label={t('Статистика привычек')}
                            description={t('Неделя, месяц и год')}
                            icon={
                                <TheLottie
                                    source={
                                        lottie['on-boarding'].calendar.graphic
                                    }
                                    style={styles.statisticsLottie}
                                />
                            }
                            RightElement={
                                <Icon
                                    name="chevron-right"
                                    size={18}
                                    color="labels-tertiary"
                                />
                            }
                            onPress={() =>
                                onOpenStatistics(activeCategory ?? undefined)
                            }
                        />
                    </Section>
                )}
            </ScrollView>
            <HabitCompletionCelebration
                visible={celebration !== null}
                previousStreak={celebration?.previousStreak ?? 0}
                streak={celebration?.streak ?? 0}
                onClose={() => setCelebration(null)}
            />
        </View>
    )
}
