import { t, useLanguage } from '@/shared/lib/i18n'
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
    useAnimatedProps,
    useDerivedValue,
    useSharedValue,
    type SharedValue,
    withTiming,
} from 'react-native-reanimated'

import type { Task, TaskCompletion, TaskStatus } from '@/shared/api'
import { getTaskDayProgress } from '@/entities/task'
import { linePath, type ChartPoint } from '@/shared/lib/chart-geometry'
import { addDays, formatShortDate } from '@/shared/lib/date'
import { graphTiming } from '@/shared/lib/motion'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Section } from '@/shared/ui/Section'
import { TheText } from '@/shared/ui/TheText'
import { Row } from '@/shared/ui/Row'

import { useStyles } from './styles'
import { TheLottie } from '@/shared/ui/TheLottie'
import { lottie } from '@/shared/config/lottie'

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

/** The last 7 days' task completion rate, mirroring `HabitStreakCard`'s chart but without a streak badge — tasks don't have an equivalent "every task every day" streak concept. */
export function TasksCompletionChart({
    tasks,
    statuses,
    completions,
    today,
    onPress,
}: {
    tasks: Task[]
    statuses: TaskStatus[]
    completions: TaskCompletion[]
    today: string
    onPress?: () => void
}) {
    const language = useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const [width, setWidth] = useState(0)
    const data = useMemo(() => {
        void language
        return Array.from({ length: 7 }, (_, index) => {
            const date = addDays(today, index - 6)
            return getTaskDayProgress(tasks, statuses, completions, date)
        })
    }, [language, tasks, statuses, completions, today])
    const targetY = useMemo(() => {
        void language
        return data.map(
            (item) =>
                PLOT_BOTTOM -
                (item.percentage / 100) * (PLOT_BOTTOM - PLOT_TOP),
        )
    }, [language, data])
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
    const animatedLineProps = useAnimatedProps(() => ({
        d: linePath(animatedPoints.get()),
    }))
    const animatedAreaProps = useAnimatedProps(() => {
        const points = animatedPoints.get()
        return {
            d: `${linePath(points)} L ${points[points.length - 1].x} ${PLOT_BOTTOM} L ${points[0].x} ${PLOT_BOTTOM} Z`,
        }
    })

    return (
        <Section paddingTop={0} paddingBottom={0}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Открыть статистику задач')}
                onPress={onPress}
                style={styles.cardBody}
            >
                <Row
                    paddingVertical={0}
                    paddingHorizontal={0}
                    icon={
                        <TheLottie
                            source={lottie['on-boarding'].calendar.graphic}
                            style={styles.statisticsLottie}
                        />
                    }
                    label={t('Статистика недели')}
                    description={t('Выполнение задач за 7 дней')}
                />
                <View
                    testID="tasks-completion-chart"
                    onLayout={(event) =>
                        setWidth(event.nativeEvent.layout.width)
                    }
                    style={styles.chartContainer}
                >
                    {width > 0 && (
                        <Svg width={width} height={CHART_HEIGHT}>
                            <Defs>
                                <LinearGradient
                                    id="tasksCompletionFill"
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
                                fill="url(#tasksCompletionFill)"
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
            </Pressable>
        </Section>
    )
}
