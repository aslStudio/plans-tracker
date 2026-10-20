import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import Svg, {
    Circle,
    Defs,
    Line,
    LinearGradient,
    Path,
    Stop,
} from 'react-native-svg'
import Animated, {
    useAnimatedStyle,
    useAnimatedProps,
    useSharedValue,
    useDerivedValue,
    type SharedValue,
    withTiming,
} from 'react-native-reanimated'

import {
    linePath,
    pointOnChart,
    type ChartPoint,
} from '@/shared/lib/chart-geometry'
import { graphTiming, layoutTiming } from '@/shared/lib/motion'

import type { Habit, HabitCompletion } from '@/shared/api'
import { addDays, formatShortDate } from '@/shared/lib/date'
import { computeAllHabitsStreak, getHabitDayProgress } from '@/entities/habit'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Section } from '@/shared/ui/Section'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'
import { useStyles } from './styles'

const CHART_HEIGHT = 118
const PLOT_TOP = 12
const PLOT_BOTTOM = 87
const PLOT_PADDING = 14
const AnimatedPath = Animated.createAnimatedComponent(Path)

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

function ChartDot({
    points,
    index,
    color,
    fill,
    last,
}: {
    points: SharedValue<ChartPoint[]>
    index: number
    color: string
    fill: string
    last: boolean
}) {
    const animatedProps = useAnimatedProps(() => ({
        cx: points.get()[index].x,
        cy: points.get()[index].y,
    }))
    return (
        <AnimatedCircle
            animatedProps={animatedProps}
            r={last ? 5 : 3.5}
            fill={fill}
            stroke={color}
            strokeWidth={last ? 2 : 1.5}
        />
    )
}

export function HabitStreakCard({
    habits,
    completionsByHabitId,
    today,
    selectedDate,
    onPress,
    onSelectDate,
}: {
    habits: Habit[]
    completionsByHabitId: Record<string, HabitCompletion[]>
    today: string
    selectedDate: string
    onPress: () => void
    onSelectDate: (date: string) => void
}) {
    const language = useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const [width, setWidth] = useState(0)
    const streak = computeAllHabitsStreak(habits, completionsByHabitId, today)
    const data = useMemo(() => {
        void language
        return Array.from({ length: 7 }, (_, index) => {
            const date = addDays(today, index - 6)
            return {
                ...getHabitDayProgress(habits, completionsByHabitId, date),
                date,
            }
        })
    }, [language, habits, completionsByHabitId, today])
    const targetY = useMemo(() => {
        void language
        return data.map(
            (item) =>
                PLOT_BOTTOM -
                (item.percentage / 100) * (PLOT_BOTTOM - PLOT_TOP),
        )
    }, [language, data])
    // Line, fill, dots and selection all read these live coordinates. Repeated
    // updates continue from the current frame, without resetting to an old target.
    const graphY = useSharedValue(targetY)
    useEffect(() => {
        graphY.set(withTiming(targetY, graphTiming))
    }, [graphY, targetY])
    const animatedPoints = useDerivedValue(() =>
        graphY.get().map((y, index, values) => ({
            x:
                PLOT_PADDING +
                (index / Math.max(1, values.length - 1)) *
                    (width - PLOT_PADDING * 2),
            y,
        })),
    )
    const selectedIndex = Math.max(
        0,
        data.findIndex((item) => item.date === selectedDate),
    )
    const selection = useSharedValue(selectedIndex)
    useEffect(() => {
        selection.set(withTiming(selectedIndex, layoutTiming))
    }, [selection, selectedIndex])
    const animatedLineProps = useAnimatedProps(() => ({
        d: linePath(animatedPoints.get()),
    }))
    const animatedAreaProps = useAnimatedProps(() => {
        const points = animatedPoints.get()
        return {
            d: `${linePath(points)} L ${points[points.length - 1].x} ${PLOT_BOTTOM} L ${points[0].x} ${PLOT_BOTTOM} Z`,
        }
    })
    const markerStyle = useAnimatedStyle(() => {
        const point = pointOnChart(animatedPoints.get(), selection.get())
        return {
            transform: [
                { translateX: point.x - 7 },
                { translateY: point.y - 7 },
            ],
        }
    })

    return (
        <Section paddingTop={0} paddingBottom={0} cardVariant="glass">
            <View style={styles.cardBody}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t(
                        'Серия привычек: {0} дней подряд. Открыть календарь',
                        [streak],
                    )}
                    onPress={onPress}
                    style={styles.headerPressable}
                >
                    <View style={styles.headerRow}>
                        <View style={styles.titleColumn}>
                            <TheText size="body" weight="600">
                                {t('Серия привычек')}
                            </TheText>
                            <TheText size="footnote" color="labels-secondary">
                                {t('Выполнение всех привычек за день')}
                            </TheText>
                        </View>
                        <View style={styles.streakBadge}>
                            <TheLottie
                                source={lottie.streak}
                                style={styles.badgeLottie}
                                accessibilityLabel={t('Серия привычек')}
                            />
                            <TheText
                                size="footnote"
                                weight="700"
                                color="labels-primary"
                            >
                                {streak}
                            </TheText>
                        </View>
                    </View>
                </Pressable>
                <View
                    testID="habit-streak-chart"
                    onLayout={(event) =>
                        setWidth(event.nativeEvent.layout.width)
                    }
                    style={styles.chartContainer}
                >
                    {width > 0 && (
                        <Svg width={width} height={CHART_HEIGHT}>
                            <Defs>
                                <LinearGradient
                                    id="habitStreakFill"
                                    x1="0"
                                    y1={PLOT_TOP}
                                    x2="0"
                                    y2={PLOT_BOTTOM}
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <Stop
                                        offset="0"
                                        stopColor={colors.brand}
                                        stopOpacity={0.25}
                                    />
                                    <Stop
                                        offset="1"
                                        stopColor={colors.brand}
                                        stopOpacity={0.01}
                                    />
                                </LinearGradient>
                            </Defs>
                            {[0, 50].map((value) => {
                                const y =
                                    PLOT_BOTTOM -
                                    (value / 100) * (PLOT_BOTTOM - PLOT_TOP)
                                return (
                                    <Line
                                        key={value}
                                        x1={PLOT_PADDING}
                                        x2={width - PLOT_PADDING}
                                        y1={y}
                                        y2={y}
                                        stroke={colors.fill.tertiary}
                                        strokeWidth={1}
                                        strokeDasharray={
                                            value === 0 ? undefined : '2 5'
                                        }
                                    />
                                )
                            })}
                            <Line
                                testID="habit-streak-goal-line"
                                x1={PLOT_PADDING}
                                x2={width - PLOT_PADDING}
                                y1={PLOT_TOP}
                                y2={PLOT_TOP}
                                stroke={colors.labels.tertiary}
                                strokeWidth={1.5}
                                strokeDasharray="4 5"
                                strokeLinecap="round"
                            />
                            <AnimatedPath
                                animatedProps={animatedAreaProps}
                                fill="url(#habitStreakFill)"
                            />
                            <AnimatedPath
                                animatedProps={animatedLineProps}
                                fill="none"
                                stroke={colors.brand}
                                strokeWidth={3.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {data.map((item, index) => (
                                <ChartDot
                                    key={item.date}
                                    points={animatedPoints}
                                    index={index}
                                    last={index === data.length - 1}
                                    color={colors.brand}
                                    fill={
                                        item.isComplete
                                            ? colors.brand
                                            : colors.backgroundGrouped.secondary
                                    }
                                />
                            ))}
                        </Svg>
                    )}
                    {width > 0 &&
                        data.map((item, index) => (
                            <Pressable
                                key={`select-${data[index].date}`}
                                accessibilityRole="button"
                                accessibilityLabel={t(
                                    'Выбрать {0}, выполнено {1}%',
                                    [
                                        formatShortDate(data[index].date),
                                        data[index].percentage,
                                    ],
                                )}
                                accessibilityState={{
                                    selected: data[index].date === selectedDate,
                                }}
                                onPress={() => onSelectDate(data[index].date)}
                                style={[
                                    styles.selectOverlay,
                                    {
                                        left: (index / data.length) * width,
                                        width: width / data.length,
                                    },
                                ]}
                            />
                        ))}
                    {width > 0 && (
                        <Animated.View
                            pointerEvents="none"
                            style={[styles.marker, markerStyle]}
                        />
                    )}
                    <View pointerEvents="none" style={styles.footerRow}>
                        {data.map((item) => (
                            <TheText
                                key={item.date}
                                size="caption-2"
                                color="labels-tertiary"
                            >
                                {formatShortDate(item.date)}
                            </TheText>
                        ))}
                    </View>
                </View>
            </View>
        </Section>
    )
}
