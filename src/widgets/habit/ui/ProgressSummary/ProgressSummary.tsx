import { t, useLanguage } from '@/shared/lib/i18n'
import { useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { formatShortDate } from '@/shared/lib/date'
import { computeSummaryDays } from '@/entities/habit'
import { TheText } from '@/shared/ui/TheText'

import type { ProgressSummaryProps } from './model'
import { useStyles } from './styles'
import { TodayProgressRing } from '../TodayProgressRing'

const SWIPE_THRESHOLD = 40
const SLIDE_DURATION = 180

/** The header's at-a-glance ring, swipeable left/right to page through nearby days that actually have habits due — each a separate `TodayProgressRing` fill, not just a static "today" snapshot. The old day's content slides out and the new one slides in from the swiped-towards side, instead of just popping to the new numbers. */
export function ProgressSummary({
    habits,
    completionsByHabitId,
    today,
}: ProgressSummaryProps) {
    useLanguage()

    const styles = useStyles()
    const [selectedDate, setSelectedDate] = useState(today)
    const [contentWidth, setContentWidth] = useState(0)
    const translateX = useSharedValue(0)

    const days = computeSummaryDays(habits, completionsByHabitId, today)
    const index = Math.max(
        0,
        days.findIndex((candidate) => candidate.date === selectedDate),
    )
    const day = days[index] ?? { date: today, done: 0, total: 0 }

    // `direction` is which way the *content* moves: 1 slides left (paging to
    // a later day), -1 slides right (an earlier day). The old content
    // animates out that way, then the new content jumps to the opposite
    // edge and animates in — the standard "slide carousel" two-step.
    function slideTo(targetDate: string, direction: 1 | -1) {
        if (contentWidth === 0) {
            setSelectedDate(targetDate)
            return
        }
        translateX.set(
            withTiming(
                -direction * contentWidth,
                { duration: SLIDE_DURATION },
                (finished) => {
                    if (!finished) return
                    runOnJS(setSelectedDate)(targetDate)
                    translateX.set(direction * contentWidth)
                    translateX.set(withTiming(0, { duration: SLIDE_DURATION }))
                },
            ),
        )
    }

    const swipe = Gesture.Pan()
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .runOnJS(true)
        .onEnd((event, success) => {
            if (!success) return
            if (
                event.translationX < -SWIPE_THRESHOLD &&
                index < days.length - 1
            ) {
                slideTo(days[index + 1].date, 1)
            } else if (event.translationX > SWIPE_THRESHOLD && index > 0) {
                slideTo(days[index - 1].date, -1)
            }
        })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.get() }],
    }))

    return (
        <GestureDetector gesture={swipe}>
            <View style={styles.root}>
                <Animated.View
                    style={[styles.content, animatedStyle]}
                    onLayout={(event: LayoutChangeEvent) =>
                        setContentWidth(event.nativeEvent.layout.width)
                    }
                >
                    <TodayProgressRing done={day.done} total={day.total} />
                    <View style={styles.texts}>
                        <TheText size="body" weight="600">
                            {day.date === today
                                ? t('Сегодня')
                                : formatShortDate(day.date)}
                        </TheText>
                        <TheText size="footnote" color="labels-secondary">
                            {day.total === 0
                                ? t('Нет привычек')
                                : t('Выполнено {0}%', [
                                      Math.round((day.done / day.total) * 100),
                                  ])}
                        </TheText>
                    </View>
                </Animated.View>
            </View>
        </GestureDetector>
    )
}
