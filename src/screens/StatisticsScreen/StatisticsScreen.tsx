import { t, useLanguage } from '@/shared/lib/i18n'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router'
import {
    habitsRepository,
    tasksRepository,
    settingsRepository,
} from '@/shared/api'
import { getTaskDayProgress } from '@/entities/task'
import { getHabitDayProgress } from '@/entities/habit'
import { todayDateString } from '@/shared/lib/date'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, getAppHeaderHeight } from '@/shared/ui/AppHeader'
import { TheText } from '@/shared/ui/TheText'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { StatisticsCard } from './StatisticsCard'

async function loadStatistics() {
    const [
        tasks,
        statuses,
        taskCompletions,
        groups,
        habits,
        completions,
        categories,
        settings,
    ] = await Promise.all([
        tasksRepository.list(),
        tasksRepository.listStatuses(),
        tasksRepository.listAllCompletions(),
        tasksRepository.listGroups(),
        habitsRepository.list(),
        habitsRepository.listAllCompletions(),
        habitsRepository.listCategories(),
        settingsRepository.get(),
    ])
    return {
        tasks,
        statuses,
        taskCompletions,
        groups,
        habits,
        completions,
        categories,
        settings,
    }
}
export function StatisticsScreen() {
    const language = useLanguage()

    const params = useLocalSearchParams<{ kind?: string; filter?: string }>()
    const isHabits = params.kind === 'habits'
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()
    const [today, setToday] = useState(todayDateString)
    const [data, setData] = useState<Awaited<
        ReturnType<typeof loadStatistics>
    > | null>(null)
    const [error, setError] = useState(false)
    const [retry, setRetry] = useState(0)
    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            let active = true
            setError(false)
            setToday(todayDateString())
            void loadStatistics()
                .then((value) => {
                    if (active) setData(value)
                })
                .catch(() => {
                    if (active) setError(true)
                })
            return () => {
                active = false
            }
            // The retry counter intentionally re-runs the focused repository read.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [language, retry]),
    )
    const groups = useMemo(() => {
        void language
        return data
            ? isHabits
                ? data.settings.useHabitCategories
                    ? data.categories
                    : []
                : data.settings.useGroups
                  ? data.groups
                  : []
            : []
    }, [language, data, isHabits])
    const getProgress = useMemo(() => {
        // Recompute localized values when the app language changes.
        void language

        const completions = Object.fromEntries(
            (data?.habits ?? []).map((h) => [
                h.id,
                data?.completions.filter((c) => c.habitId === h.id) ?? [],
            ]),
        )
        const selections = new Map(
            [null, 'uncategorized', ...groups.map((group) => group.id)].map(
                (filter) => {
                    const matches = (id?: string | null) =>
                        !filter ||
                        (filter === 'uncategorized'
                            ? !groups.some((group) => group.id === id)
                            : id === filter)
                    return [
                        filter,
                        {
                            habits:
                                data?.habits.filter((h) =>
                                    matches(h.categoryId),
                                ) ?? [],
                            tasks:
                                data?.tasks.filter((t) => matches(t.groupId)) ??
                                [],
                        },
                    ] as const
                },
            ),
        )
        return (date: string, filter: string | null) => {
            const selection = selections.get(filter) ?? selections.get(null)!
            return isHabits
                ? getHabitDayProgress(selection.habits, completions, date)
                : getTaskDayProgress(
                      selection.tasks,
                      data?.statuses ?? [],
                      data?.taskCompletions ?? [],
                      date,
                  )
        }
    }, [language, data, groups, isHabits])
    return (
        <View
            style={[
                styles.root,
                { backgroundColor: colors.backgroundGrouped.primary },
            ]}
        >
            <ScreenGradientBackground />
            <AppHeader
                isModal
                LeftItem={
                    <View>
                        <TheText size="title-2" weight="700">
                            {t('Статистика')}
                        </TheText>
                        <TheText size="caption-1" color="labels-secondary">
                            {isHabits ? t('Привычки') : t('Задачи')}
                        </TheText>
                    </View>
                }
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        accessibilityLabel={t('Закрыть')}
                        onPress={() => router.back()}
                    />
                }
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: getAppHeaderHeight(true, insets.top),
                        paddingBottom: insets.bottom + 32,
                    },
                ]}
            >
                {error ? (
                    <View style={styles.note}>
                        <TheText>
                            {t('Не удалось загрузить статистику')}
                        </TheText>
                        <TheButton
                            size="36"
                            onPress={() => setRetry((value) => value + 1)}
                        >
                            {t('Попробовать ещё раз')}
                        </TheButton>
                    </View>
                ) : !data ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        {(['week', 'month', 'year'] as const).map((period) => (
                            <StatisticsCard
                                key={period}
                                period={period}
                                today={today}
                                groups={groups}
                                isHabits={isHabits}
                                initialFilter={params.filter}
                                getProgress={getProgress}
                            />
                        ))}
                        <View style={styles.note}>
                            <TheText size="caption-1" color="labels-tertiary">
                                {t(
                                    'Среднее — по всем прошедшим дням периода, включая дни без выполнений. Досрочные выполнения учитываются на запланированных датах и добавляют эти дни в расчёт. Остальные будущие дни остаются пустыми. Нажмите на график, чтобы посмотреть день или месяц.',
                                )}
                                {!isHabits &&
                                    ' ' +
                                        t(
                                            'Задачи на несколько дней учитываются в каждом из них, по текущему статусу.',
                                        ) +
                                        ''}
                            </TheText>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    root: { flex: 1 },
    content: { gap: 14 },
    note: { paddingHorizontal: 32, gap: 12 },
})
