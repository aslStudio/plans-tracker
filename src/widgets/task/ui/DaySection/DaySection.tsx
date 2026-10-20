import { t, useLanguage } from '@/shared/lib/i18n'
import { TODO_STATUS_ID } from '@/shared/api'
import { DragSource, DropZone } from '@/shared/ui/DragDropList/DragDropList'
import { lottie } from '@/shared/config/lottie'
import Animated from 'react-native-reanimated'
import { listLayout, listEnter, listExit } from '@/shared/lib/motion'
import { useMemo, useState } from 'react'
import { View } from 'react-native'
import type { SFSymbol } from 'sf-symbols-typescript'

import { NativeMenu, type NativeMenuItem } from '@/shared/ui/NativeMenu'
import { Placeholder } from '@/shared/ui/Placeholder'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { TheLottie } from '@/shared/ui/TheLottie'

import {
    DEFAULT_TASK_SORT,
    filterTasksByGroup,
    hasAnyDateData,
    hasAnyPriorityData,
    isTaskOverdue,
    nextSortOnFieldPress,
    resolveDateLineText,
    resolveGroupLabel,
    resolvePriorityLabel,
    sortTasks,
    TASK_SORT_FIELD_LABELS,
    TASK_SORT_FIELDS,
    type GroupFilterSelection,
    type TaskOccurrence,
    type TaskSort,
} from '@/entities/task'
import { SwipeableTaskRow } from '../SwipeableTaskRow'
import { TaskRow } from '../TaskRow'
import type { DaySectionProps } from './model'
import { useStyles } from './styles'

/** One day's worth of tasks as its own sortable/filterable card — shared by `TasksScreen` (one per day-of-the-week bucket) and `DayTasksScreen` (a single specific date). */
export function DaySection({
    sectionKey,
    animated = true,
    title,
    tasks,
    completions = [],
    dayDate,
    statuses,
    groups,
    priorities,
    useGroups,
    usePriority,
    today,
    alwaysShow,
    onOpenTask,
    onCompleteTask,
    onDeleteTask,
    onAddTask,
    onAdvanceStatus,
}: DaySectionProps) {
    const language = useLanguage()

    const styles = useStyles()
    const [sort, setSort] = useState<TaskSort>(DEFAULT_TASK_SORT)
    const [groupFilter, setGroupFilter] = useState<GroupFilterSelection>('all')

    const completedOccurrences = useMemo(() => {
        void language
        return new Set(
            completions.map((item) => `${item.taskId}:${item.occurrenceDate}`),
        )
    }, [language, completions])

    if (tasks.length === 0 && !alwaysShow) return null

    const visibleTasks = sortTasks(
        filterTasksByGroup(tasks, groupFilter),
        statuses,
        priorities,
        sort,
    ) as TaskOccurrence[]

    const directionSystemImage: SFSymbol =
        sort.direction === 'asc' ? 'arrow.up' : 'arrow.down'
    const sortItems: NativeMenuItem[] = TASK_SORT_FIELDS.filter((field) => {
        if (field === 'deadline') return hasAnyDateData(tasks)
        if (field === 'priority')
            return usePriority && hasAnyPriorityData(tasks)
        return true
    }).map((field) => ({
        key: field,
        label: TASK_SORT_FIELD_LABELS[field],
        systemImage: directionSystemImage,
        icon: 'arrow-up',
        iconFlipped: sort.direction === 'desc',
        isActive: sort.field === field,
        onPress: () =>
            setSort((current) => nextSortOnFieldPress(current, field)),
    }))

    const checkmarkSystemImage: SFSymbol = 'checkmark'
    const filterItems: NativeMenuItem[] = [
        {
            key: 'all',
            label: t('Все'),
            systemImage: checkmarkSystemImage,
            icon: 'check-outline',
            isActive: groupFilter === 'all',
            onPress: () => setGroupFilter('all'),
        },
        ...groups.map((group): NativeMenuItem => ({
            key: group.id,
            label: group.label,
            systemImage: checkmarkSystemImage,
            icon: 'check-outline',
            isActive: groupFilter === group.id,
            onPress: () => setGroupFilter(group.id),
        })),
        {
            key: 'ungrouped',
            label: t('Другие'),
            systemImage: checkmarkSystemImage,
            icon: 'check-outline',
            isActive: groupFilter === 'ungrouped',
            onPress: () => setGroupFilter('ungrouped'),
        },
    ]

    return (
        <DropZone
            disabled={sectionKey === 'overdue' || sectionKey === 'backlog'}
            id={
                sectionKey === 'backlog'
                    ? 'backlog'
                    : sectionKey === 'overdue'
                      ? 'overdue'
                      : dayDate
            }
        >
            <Section
                animated={animated}
                TopElement={
                    <View style={styles.sectionTitle}>
                        <TheText
                            size="body"
                            weight="600"
                            color="labels-secondary"
                        >
                            {title}
                        </TheText>
                        <View style={styles.sectionActions}>
                            <NativeMenu
                                items={sortItems}
                                trigger={
                                    <TheButtonIcon
                                        icon="sort"
                                        size="28"
                                        variant="plain"
                                        view="neutral"
                                        accessibilityLabel={t('Сортировка')}
                                        onPress={() => {}}
                                    />
                                }
                            />
                            {useGroups && (
                                <NativeMenu
                                    items={filterItems}
                                    trigger={
                                        <TheButtonIcon
                                            icon="filter"
                                            size="28"
                                            variant="plain"
                                            view="neutral"
                                            accessibilityLabel={t('Фильтр')}
                                            onPress={() => {}}
                                        />
                                    }
                                />
                            )}
                        </View>
                    </View>
                }
            >
                {tasks.length === 0 ? (
                    <Animated.View
                        key="empty"
                        layout={animated ? listLayout : undefined}
                        entering={animated ? listEnter : undefined}
                        exiting={animated ? listExit : undefined}
                        style={styles.emptyDay}
                    >
                        <Placeholder
                            title={t('Нет задач')}
                            description={t('Можно добавить новую задачу')}
                        >
                            <TheLottie
                                source={lottie.pencil}
                                style={styles.emptyLottie}
                            />
                        </Placeholder>
                        <View
                            testID="empty-day-action"
                            style={styles.emptyButton}
                        >
                            <TheButton
                                size="44"
                                variant="secondary"
                                view="brand"
                                onPress={onAddTask}
                            >
                                {t('Добавить')}
                            </TheButton>
                        </View>
                    </Animated.View>
                ) : visibleTasks.length === 0 ? (
                    <Animated.View
                        key="empty"
                        layout={animated ? listLayout : undefined}
                        entering={animated ? listEnter : undefined}
                        exiting={animated ? listExit : undefined}
                        style={styles.emptyDay}
                    >
                        <Placeholder title={t('Нет задач с этим фильтром')} />
                    </Animated.View>
                ) : (
                    visibleTasks.map((task, index) => {
                        const status = statuses.find(
                            (s) =>
                                s.id ===
                                (task.repeat
                                    ? (task.occurrenceStatusIds?.[
                                          task.occurrenceDate ?? dayDate
                                      ] ?? TODO_STATUS_ID)
                                    : task.statusId),
                        )
                        if (!status) return null
                        const occurrenceDate = task.occurrenceDate ?? dayDate
                        const occurrenceCompleted = Boolean(
                            task.repeat &&
                            completedOccurrences.has(
                                `${task.id}:${occurrenceDate}`,
                            ),
                        )
                        const completedStatus = occurrenceCompleted
                            ? (statuses.find(
                                  (candidate) => candidate.isCompleted,
                              ) ?? status)
                            : status
                        const overdue =
                            task.repeat && task.occurrenceDate
                                ? task.occurrenceDate < today &&
                                  !occurrenceCompleted
                                : isTaskOverdue(task, statuses, today)

                        return (
                            <Animated.View
                                key={`${task.id}-${occurrenceDate}`}
                                layout={animated ? listLayout : undefined}
                                entering={animated ? listEnter : undefined}
                                exiting={animated ? listExit : undefined}
                            >
                                {index > 0 && <Separator offsetLeft={16} />}
                                <DragSource
                                    item={{
                                        id: task.id,
                                        title: task.title,
                                        from:
                                            sectionKey === 'backlog'
                                                ? 'backlog'
                                                : sectionKey === 'overdue'
                                                  ? 'overdue'
                                                  : dayDate,
                                    }}
                                >
                                    <SwipeableTaskRow
                                        taskId={task.id}
                                        instanceKey={`${sectionKey}-${task.id}`}
                                        isCompleted={
                                            completedStatus.isCompleted
                                        }
                                        onComplete={() =>
                                            onCompleteTask(
                                                task.id,
                                                occurrenceDate,
                                            )
                                        }
                                        onDelete={() => onDeleteTask(task.id)}
                                        onEdit={() =>
                                            task.repeat
                                                ? onOpenTask(
                                                      task.id,
                                                      occurrenceDate,
                                                  )
                                                : onOpenTask(task.id)
                                        }
                                    >
                                        <TaskRow
                                            task={task}
                                            status={completedStatus}
                                            isOverdue={overdue}
                                            dateLineText={resolveDateLineText(
                                                task,
                                                dayDate,
                                            )}
                                            priorityLabel={resolvePriorityLabel(
                                                task,
                                                priorities,
                                                usePriority,
                                            )}
                                            groupLabel={resolveGroupLabel(
                                                task,
                                                groups,
                                                useGroups,
                                            )}
                                            onPress={() =>
                                                task.repeat
                                                    ? onOpenTask(
                                                          task.id,
                                                          occurrenceDate,
                                                      )
                                                    : onOpenTask(task.id)
                                            }
                                            onAdvanceStatus={() =>
                                                task.repeat
                                                    ? onAdvanceStatus(
                                                          task.id,
                                                          occurrenceDate,
                                                      )
                                                    : onAdvanceStatus(task.id)
                                            }
                                        />
                                    </SwipeableTaskRow>
                                </DragSource>
                            </Animated.View>
                        )
                    })
                )}
            </Section>
        </DropZone>
    )
}
