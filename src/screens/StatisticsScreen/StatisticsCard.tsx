import { t, getLocale, useLanguage } from '@/shared/lib/i18n'
import { useMemo, useState } from 'react'
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated'
import { StyleSheet, View } from 'react-native'
import { formatShortDate, parseLocalDateString } from '@/shared/lib/date'
import { NativeMenu } from '@/shared/ui/NativeMenu'
import { Section } from '@/shared/ui/Section'
import { TheText } from '@/shared/ui/TheText'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import {
    buildStatistics,
    hasStatisticsData,
    movePeriod,
    periodRange,
    type Period,
} from './model'
import { StatisticsChart } from './StatisticsChart'

type Group = { id: string; label: string }
export type StatisticsCardProps = {
    period: Period
    today: string
    groups: Group[]
    isHabits: boolean
    initialFilter?: string
    getProgress: (
        date: string,
        filter: string | null,
    ) => { done: number; total: number }
}
const periodLabels: Record<Period, string> = {
    get week() {
        return t('Неделя')
    },
    get month() {
        return t('Месяц')
    },
    get year() {
        return t('Год')
    },
}
const number = (value: number | null) =>
    value === null
        ? '—'
        : value.toLocaleString(getLocale(), { maximumFractionDigits: 1 })

export function StatisticsCard({
    period,
    today,
    groups,
    isHabits,
    initialFilter,
    getProgress,
}: StatisticsCardProps) {
    const language = useLanguage()

    const [anchor, setAnchor] = useState(today)
    const [filter, setFilter] = useState<string | null>(initialFilter ?? null)
    const [selected, setSelected] = useState<string | null>(null)
    const activeFilter =
        groups.length &&
        (filter === 'uncategorized' || groups.some((g) => g.id === filter))
            ? filter
            : null
    const range = periodRange(anchor, period)
    const { data, canGoBack, canGoForward } = useMemo(() => {
        // Recompute localized values when the app language changes.
        void language

        const cache = new Map<string, { done: number; total: number }>()
        const progress = (date: string) => {
            let value = cache.get(date)
            if (!value) {
                value = getProgress(date, activeFilter)
                cache.set(date, value)
            }
            return value
        }
        const previous = movePeriod(anchor, period, -1)
        const next = movePeriod(anchor, period, 1)
        return {
            data: buildStatistics(anchor, period, today, progress),
            canGoBack: hasStatisticsData(previous, period, today, progress),
            canGoForward:
                next <= today ||
                hasStatisticsData(next, period, today, progress),
        }
    }, [language, anchor, period, today, getProgress, activeFilter])
    const chosen = data.buckets.find((b) => b.date === selected)
    const options = [
        { id: null, label: isHabits ? t('Все категории') : t('Все группы') },
        ...groups,
        {
            id: 'uncategorized',
            label: isHabits ? t('Без категории') : t('Без группы'),
        },
    ]
    const title =
        period === 'year'
            ? range.start.slice(0, 4)
            : period === 'month'
              ? parseLocalDateString(range.start).toLocaleDateString(
                    getLocale(),
                    {
                        month: 'long',
                        year: 'numeric',
                    },
                )
              : `${formatShortDate(range.start)} — ${formatShortDate(range.end)}`
    const changeAnchor = (direction: number) => {
        if (direction < 0 ? !canGoBack : !canGoForward) return
        setAnchor(movePeriod(anchor, period, direction))
        setSelected(null)
    }
    const selectionLabel = chosen
        ? period === 'year'
            ? parseLocalDateString(`${chosen.date}-01`).toLocaleDateString(
                  getLocale(),
                  { month: 'long', year: 'numeric' },
              )
            : formatShortDate(chosen.date)
        : null
    return (
        <Section
            paddingTop={0}
            paddingBottom={0}
            TopElement={
                <View style={styles.sectionTitle}>
                    <TheText size="body" weight="600" color="labels-secondary">
                        {periodLabels[period]}
                    </TheText>
                </View>
            }
        >
            <View style={styles.card}>
                <View style={styles.heading}>
                    <View style={styles.period}>
                        <TheButtonIcon
                            icon="chevron-left"
                            size="28"
                            variant="plain"
                            view="neutral"
                            isDisabled={!canGoBack}
                            accessibilityLabel={t('Предыдущий период')}
                            onPress={() => changeAnchor(-1)}
                        />
                        <View style={styles.periodTitle}>
                            <TheText
                                size="subheadline"
                                weight="500"
                                style={styles.capitalize}
                            >
                                {title}
                            </TheText>
                        </View>
                        <TheButtonIcon
                            icon="chevron-right"
                            size="28"
                            variant="plain"
                            view="neutral"
                            isDisabled={!canGoForward}
                            accessibilityLabel={t('Следующий период')}
                            onPress={() => changeAnchor(1)}
                        />
                    </View>
                    {groups.length > 0 && (
                        <View style={styles.filter}>
                            <NativeMenu
                                items={options.map((option) => ({
                                    key: option.id ?? 'all',
                                    label: option.label,
                                    systemImage: 'checkmark',
                                    icon: 'check-outline',
                                    isActive: activeFilter === option.id,
                                    onPress: () => {
                                        setFilter(option.id)
                                        setSelected(null)
                                    },
                                }))}
                                trigger={
                                    <TheButtonIcon
                                        icon="filter"
                                        size="28"
                                        variant="plain"
                                        view={
                                            activeFilter ? 'brand' : 'neutral'
                                        }
                                        accessibilityLabel={
                                            isHabits
                                                ? t('Фильтр по категориям')
                                                : t('Фильтр по группам')
                                        }
                                        onPress={() => {}}
                                    />
                                }
                            />
                        </View>
                    )}
                </View>
                <View style={styles.metrics}>
                    <View style={styles.primaryMetric}>
                        <TheText size="title-2" weight="600" color="brand">
                            {number(data.averageRate)}
                            {data.averageRate === null ? '' : '%'}
                        </TheText>
                        <TheText size="caption-1" color="labels-secondary">
                            {t('В среднем за день')}
                        </TheText>
                    </View>
                    <View style={styles.secondaryMetric}>
                        <TheText size="body" weight="600">
                            {number(data.done)} / {number(data.total)}
                        </TheText>
                        <TheText size="caption-1" color="labels-secondary">
                            {t('Выполнено')}
                        </TheText>
                    </View>
                </View>
                <Animated.View
                    key={`${period}-${anchor}-${activeFilter}`}
                    entering={FadeIn.duration(240).reduceMotion(
                        ReduceMotion.System,
                    )}
                >
                    <StatisticsChart
                        buckets={data.buckets}
                        metric="rate"
                        selected={selected}
                        onSelect={setSelected}
                        average={data.averageRate}
                    />
                </Animated.View>
                <View style={styles.detail}>
                    <TheText
                        size="caption-1"
                        weight="500"
                        color={chosen ? 'labels-primary' : 'labels-secondary'}
                    >
                        {chosen
                            ? `${selectionLabel} · ${chosen.future ? t('Ещё впереди') : chosen.total === 0 ? t('Нет запланированных выполнений') : t('{0} из {1} · {2}%', [chosen.done, chosen.total, number(chosen.rate)])}`
                            : data.total
                              ? t('Дней на 100%: {0} · {1}', [
                                    data.completeDays,
                                    period === 'year'
                                        ? t('график по месяцам')
                                        : t('график по дням'),
                                ])
                              : t('Пока нет запланированных выполнений')}
                    </TheText>
                    {(range.end < today || range.start > today) && (
                        <TheButton
                            size="28"
                            variant="plain"
                            onPress={() => {
                                setAnchor(today)
                                setSelected(null)
                            }}
                        >
                            {t('К текущему периоду')}
                        </TheButton>
                    )}
                </View>
            </View>
        </Section>
    )
}
const styles = StyleSheet.create({
    card: { padding: 16, gap: 10 },
    sectionTitle: { paddingHorizontal: 16, paddingBottom: 8 },
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    filter: { flexShrink: 0 },
    period: {
        flexShrink: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    periodTitle: { flexShrink: 1, alignItems: 'center' },
    capitalize: { textTransform: 'capitalize' },
    metrics: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    primaryMetric: { flex: 1, gap: 2 },
    secondaryMetric: { gap: 2, alignItems: 'flex-end' },
    detail: { gap: 6, minHeight: 16 },
})
