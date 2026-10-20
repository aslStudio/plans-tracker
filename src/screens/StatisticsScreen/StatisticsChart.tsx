import { t, useLanguage } from '@/shared/lib/i18n'
import { useId, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Svg, {
    Circle,
    Defs,
    Line,
    LinearGradient,
    Path,
    Stop,
    Text as SvgText,
} from 'react-native-svg'
import { linePath, type ChartPoint } from '@/shared/lib/chart-geometry'
import { useTheme } from '@/shared/lib/theme/use-theme'
import type { StatisticsBucket } from './model'

const HEIGHT = 140
const TOP = 10
const BOTTOM = 112
const LEFT = 10
const RIGHT = 32

export function StatisticsChart({
    buckets,
    metric,
    selected,
    onSelect,
    average,
}: {
    buckets: StatisticsBucket[]
    metric: 'rate' | 'count'
    selected: string | null
    onSelect: (date: string) => void
    average: number | null
}) {
    useLanguage()

    const { colors } = useTheme()
    const [width, setWidth] = useState(0)
    const fillId = useId().replace(/:/g, '')
    const value = (bucket: StatisticsBucket) =>
        bucket.future
            ? null
            : metric === 'rate'
              ? (bucket.rate ?? 0)
              : bucket.done
    const max =
        metric === 'rate'
            ? 100
            : Math.max(1, ...buckets.map((b) => value(b) ?? 0))
    const x = (i: number) =>
        LEFT + (i / Math.max(1, buckets.length - 1)) * (width - LEFT - RIGHT)
    const y = (v: number) => BOTTOM - (v / max) * (BOTTOM - TOP)
    const segments: ChartPoint[][] = []
    let segment: ChartPoint[] = []
    buckets.forEach((bucket, i) => {
        const v = value(bucket)
        if (v === null) {
            if (segment.length) segments.push(segment)
            segment = []
        } else segment.push({ x: x(i), y: y(v) })
    })
    if (segment.length) segments.push(segment)
    const selectedIndex = buckets.findIndex((b) => b.date === selected)
    const labelIndices = new Set(
        buckets.length <= 12
            ? buckets.map((_, i) => i)
            : [0, 7, 14, 21, buckets.length - 1],
    )
    return (
        <View
            testID="statistics-chart"
            onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
            style={styles.chart}
        >
            {width > RIGHT + LEFT && (
                <>
                    <Svg width={width} height={HEIGHT}>
                        <Defs>
                            <LinearGradient
                                id={fillId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <Stop
                                    offset="0"
                                    stopColor={colors.brand}
                                    stopOpacity={0.22}
                                />
                                <Stop
                                    offset="1"
                                    stopColor={colors.brand}
                                    stopOpacity={0.01}
                                />
                            </LinearGradient>
                        </Defs>
                        {[0, 0.5, 1].map((ratio) => (
                            <Line
                                key={ratio}
                                x1={LEFT}
                                x2={width - RIGHT}
                                y1={y(max * ratio)}
                                y2={y(max * ratio)}
                                stroke={colors.fill.tertiary}
                                strokeDasharray={ratio ? '3 5' : undefined}
                            />
                        ))}
                        {[0, 1].map((ratio) => (
                            <SvgText
                                key={ratio}
                                x={width}
                                y={y(max * ratio) + 4}
                                textAnchor="end"
                                fontSize={10}
                                fill={colors.labels.tertiary}
                            >
                                {Math.round(max * ratio)}
                                {metric === 'rate' ? '%' : ''}
                            </SvgText>
                        ))}
                        {average !== null && average <= max && (
                            <Line
                                x1={LEFT}
                                x2={width - RIGHT}
                                y1={y(average)}
                                y2={y(average)}
                                stroke={colors.brand}
                                strokeOpacity={0.45}
                                strokeDasharray="4 5"
                            />
                        )}
                        {segments.map((points, index) => (
                            <Path
                                key={`fill-${index}`}
                                d={`${linePath(points)} L ${points.at(-1)!.x} ${BOTTOM} L ${points[0].x} ${BOTTOM} Z`}
                                fill={`url(#${fillId})`}
                            />
                        ))}
                        {segments.map((points, index) => (
                            <Path
                                key={index}
                                testID="statistics-chart-line"
                                d={linePath(points)}
                                fill="none"
                                stroke={colors.brand}
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                        {selectedIndex >= 0 && (
                            <Line
                                x1={x(selectedIndex)}
                                x2={x(selectedIndex)}
                                y1={TOP}
                                y2={BOTTOM}
                                stroke={colors.labels.tertiary}
                                strokeDasharray="3 4"
                            />
                        )}
                        {buckets.map((bucket, i) => {
                            const v = value(bucket)
                            return (
                                <Circle
                                    key={bucket.date}
                                    cx={x(i)}
                                    cy={v === null ? BOTTOM : y(v)}
                                    r={
                                        bucket.date === selected
                                            ? 5
                                            : v === null
                                              ? 2
                                              : 3
                                    }
                                    stroke={
                                        v === null
                                            ? colors.labels.tertiary
                                            : colors.brand
                                    }
                                    strokeWidth={1.5}
                                    fill={
                                        v === null
                                            ? colors.backgroundGrouped.secondary
                                            : colors.brand
                                    }
                                />
                            )
                        })}
                        {buckets.map(
                            (bucket, i) =>
                                labelIndices.has(i) && (
                                    <SvgText
                                        key={bucket.date}
                                        x={x(i)}
                                        y={HEIGHT - 10}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fill={
                                            bucket.future
                                                ? colors.labels.tertiary
                                                : colors.labels.secondary
                                        }
                                    >
                                        {bucket.label}
                                    </SvgText>
                                ),
                        )}
                    </Svg>
                    <View style={StyleSheet.absoluteFill}>
                        {buckets.map((bucket, index) => (
                            <Pressable
                                key={bucket.date}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left:
                                        index === 0
                                            ? 0
                                            : (x(index - 1) + x(index)) / 2,
                                    right:
                                        index === buckets.length - 1
                                            ? 0
                                            : width -
                                              (x(index) + x(index + 1)) / 2,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={`${bucket.date}: ${bucket.future ? t('Будущий период') : bucket.total ? t('{0} из {1}', [bucket.done, bucket.total]) : t('Нет запланированных выполнений')}`}
                                accessibilityState={{
                                    selected: selected === bucket.date,
                                }}
                                onPress={() => onSelect(bucket.date)}
                            />
                        ))}
                    </View>
                </>
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    chart: { height: HEIGHT },
})
