import { t, useLanguage } from '@/shared/lib/i18n'
import type { TaskCompletion } from '@/shared/api'
import { createAgendaIndex } from './agenda-index'
import { DaySkeleton } from './DaySkeleton'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, View } from 'react-native'

import {
    earliestTaskMonth,
    nextSortOnFieldPress,
    type TaskAgendaDay,
    type TaskSort,
    type GroupFilterSelection,
} from '@/entities/task'
import {
    addDays,
    toLocalDateString,
    todayDateString,
    tomorrowDateString,
} from '@/shared/lib/date'
import { AppHeader } from '@/shared/ui/AppHeader'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { AgendaCellView } from './AgendaCellView'
import {
    createAgendaCells,
    DEFAULT_DAY_PREFERENCES,
    type AgendaCell,
    type DayPreferences,
} from './agenda-cells'

import type { AllTasksScreenProps } from './model'
import { useStyles } from './styles'

const EMPTY_COMPLETIONS: TaskCompletion[] = []
const cellKey = (cell: AgendaCell) => cell.key
const VISIBLE_POSITION = { minIndexForVisible: 0 }

const PAST_CHUNK_DAYS = 30
const FORWARD_CHUNK_DAYS = 10
const FORWARD_MAX_DAYS = 365

/**
 * "Все задачи" — a continuous, scrollable agenda across every day, not a
 * month-grid picker: today plus every later day with a task (skipping empty
 * gaps) and one trailing empty day. Opens scrolled to today; scrolling up
 * lazily reveals earlier days that had something due, same skip-empty rule.
 */
export function AllTasksScreen({
    tasks,
    isLoading = false,
    taskCompletions = EMPTY_COMPLETIONS,
    statuses,
    groups,
    priorities,
    useGroups,
    usePriority,
    onClose,
    onAddTask,
    onOpenTask,
    onCompleteTask,
    onDeleteTask,
    onAdvanceStatus,
}: AllTasksScreenProps) {
    const language = useLanguage()

    const styles = useStyles()
    const today = todayDateString()
    const tomorrow = tomorrowDateString()

    const dayAt = useMemo(() => {
        void language
        return createAgendaIndex(tasks)
    }, [language, tasks])
    const [forwardWindow, setForwardWindow] = useState(FORWARD_CHUNK_DAYS)
    const [pastWindow, setPastWindow] = useState(0)
    const [pending, setPending] = useState<'past' | 'future' | null>(null)
    const interacted = useRef(false)
    const futureBoundary = useMemo(() => {
        // Recompute localized values when the app language changes.
        void language

        if (tasks.some((task) => task.repeat))
            return addDays(today, FORWARD_MAX_DAYS)
        return tasks.reduce((last, task) => {
            const end = task.endDate ?? task.startDate ?? today
            return end > last ? end : last
        }, today)
    }, [language, tasks, today])
    const earliestBoundary = useMemo(() => {
        // Recompute localized values when the app language changes.
        void language

        const earliest = earliestTaskMonth(tasks)
        return earliest ? toLocalDateString(earliest) : today
    }, [language, tasks, today])
    const hasMoreFuture = addDays(today, forwardWindow) < futureBoundary
    const hasMorePast = addDays(today, -pastWindow) > earliestBoundary

    // Let the loading card paint before scanning/mounting another page.
    useEffect(() => {
        if (!pending) return
        let timer: ReturnType<typeof setTimeout> | undefined
        const frame = requestAnimationFrame(() => {
            timer = setTimeout(() => {
                if (pending === 'future') {
                    const next = forwardWindow + FORWARD_CHUNK_DAYS
                    let found = false
                    for (
                        let offset = forwardWindow + 1;
                        offset <= next;
                        offset++
                    ) {
                        const date = addDays(today, offset)
                        if (date > futureBoundary) break
                        if (dayAt(date).tasks.length) found = true
                    }
                    setForwardWindow(next)
                    if (found || addDays(today, next) >= futureBoundary)
                        setPending(null)
                } else {
                    const next = pastWindow + PAST_CHUNK_DAYS
                    let found = false
                    for (
                        let offset = pastWindow + 1;
                        offset <= next;
                        offset++
                    ) {
                        const date = addDays(today, -offset)
                        if (date < earliestBoundary) break
                        if (dayAt(date).tasks.length) found = true
                    }
                    setPastWindow(next)
                    if (found || addDays(today, -next) <= earliestBoundary)
                        setPending(null)
                }
            }, 0)
        })
        return () => {
            cancelAnimationFrame(frame)
            if (timer !== undefined) clearTimeout(timer)
        }
    }, [
        pending,
        forwardWindow,
        pastWindow,
        today,
        futureBoundary,
        earliestBoundary,
        dayAt,
    ])
    const loadMoreFuture = useCallback(() => {
        // Recompute localized values when the app language changes.
        void language

        if (!isLoading && !pending && hasMoreFuture) setPending('future')
    }, [language, isLoading, pending, hasMoreFuture])
    const loadMorePast = useCallback(() => {
        // Recompute localized values when the app language changes.
        void language

        if (interacted.current && !isLoading && !pending && hasMorePast)
            setPending('past')
    }, [language, isLoading, pending, hasMorePast])

    const days = useMemo(() => {
        // Recompute localized values when the app language changes.
        void language

        if (isLoading) return []
        const result: TaskAgendaDay[] = []
        for (let offset = -pastWindow; offset <= forwardWindow; offset++) {
            const date = addDays(today, offset)
            if (date < earliestBoundary && offset < 0) continue
            if (date > futureBoundary && offset > 0) break
            const day = dayAt(date)
            if (date === today || day.tasks.length) result.push(day)
        }
        // A genuine empty add-day card is only shown after the last page.
        // During pagination the footer is a skeleton, never a fake empty day.
        if (!hasMoreFuture) {
            const last = result[result.length - 1]?.date ?? today
            const next = dayAt(addDays(last, 1))
            if (!next.tasks.length) result.push(next)
        }
        return result
    }, [
        language,
        isLoading,
        pastWindow,
        forwardWindow,
        today,
        earliestBoundary,
        futureBoundary,
        dayAt,
        hasMoreFuture,
    ])
    const [preferences, setPreferences] = useState<
        Record<string, DayPreferences>
    >({})
    const cellsForDay = useMemo(() => {
        void language
        return createAgendaCells(statuses, priorities)
    }, [language, statuses, priorities])
    const cells = useMemo(() => {
        void language
        return days.flatMap((day) =>
            cellsForDay(day, preferences[day.date] ?? DEFAULT_DAY_PREFERENCES),
        )
    }, [language, days, cellsForDay, preferences])
    const completed = useMemo(() => {
        void language
        return new Set(
            taskCompletions.map(
                (item) => `${item.taskId}:${item.occurrenceDate}`,
            ),
        )
    }, [language, taskCompletions])
    const onSort = useCallback(
        (date: string, field: TaskSort['field']) => {
            // Recompute localized values when the app language changes.
            void language

            setPreferences((current) => {
                const previous = current[date] ?? DEFAULT_DAY_PREFERENCES
                return {
                    ...current,
                    [date]: {
                        ...previous,
                        sort: nextSortOnFieldPress(previous.sort, field),
                    },
                }
            })
        },
        [language],
    )
    const onFilter = useCallback(
        (date: string, group: GroupFilterSelection) => {
            // Recompute localized values when the app language changes.
            void language

            setPreferences((current) => ({
                ...current,
                [date]: {
                    ...(current[date] ?? DEFAULT_DAY_PREFERENCES),
                    group,
                },
            }))
        },
        [language],
    )
    const renderCell = useCallback(
        ({ item }: { item: AgendaCell }) => {
            void language
            return (
                <AgendaCellView
                    cell={item}
                    today={today}
                    tomorrow={tomorrow}
                    completed={completed}
                    statuses={statuses}
                    groups={groups}
                    priorities={priorities}
                    useGroups={useGroups}
                    usePriority={usePriority}
                    onAddTask={onAddTask}
                    onOpenTask={onOpenTask}
                    onCompleteTask={onCompleteTask}
                    onDeleteTask={onDeleteTask}
                    onAdvanceStatus={onAdvanceStatus}
                    onSort={onSort}
                    onFilter={onFilter}
                />
            )
        },
        [
            language,
            today,
            tomorrow,
            completed,
            statuses,
            groups,
            priorities,
            useGroups,
            usePriority,
            onAddTask,
            onOpenTask,
            onCompleteTask,
            onDeleteTask,
            onAdvanceStatus,
            onSort,
            onFilter,
        ],
    )

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={
                    <TheText size="body" weight="600">
                        {t('Все задачи')}
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
            <FlatList
                testID="all-tasks-list"
                style={styles.root}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                data={cells}
                keyExtractor={cellKey}
                initialNumToRender={12}
                maxToRenderPerBatch={4}
                windowSize={5}
                onScrollBeginDrag={() => {
                    interacted.current = true
                }}
                ListEmptyComponent={
                    isLoading ? (
                        <View testID="all-tasks-loading">
                            <DaySkeleton />
                            <DaySkeleton />
                            <DaySkeleton />
                        </View>
                    ) : null
                }
                ListHeaderComponent={
                    pending === 'past' ? <DaySkeleton /> : null
                }
                ListFooterComponent={
                    !isLoading && hasMoreFuture ? <DaySkeleton /> : null
                }
                onStartReached={loadMorePast}
                onStartReachedThreshold={0.5}
                onEndReached={loadMoreFuture}
                onEndReachedThreshold={0.5}
                maintainVisibleContentPosition={VISIBLE_POSITION}
                renderItem={renderCell}
            />
        </View>
    )
}
