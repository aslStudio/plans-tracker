import { t, useLanguage } from '@/shared/lib/i18n'
import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { TODO_STATUS_ID } from '@/shared/api'
import {
    hasAnyDateData,
    hasAnyPriorityData,
    isTaskOverdue,
    resolveDateLineText,
    resolveGroupLabel,
    resolvePriorityLabel,
    TASK_SORT_FIELDS,
    TASK_SORT_FIELD_LABELS,
    type TaskSort,
    type GroupFilterSelection,
} from '@/entities/task'
import { formatShortDate } from '@/shared/lib/date'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { NativeMenu, type NativeMenuItem } from '@/shared/ui/NativeMenu'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { TheButton } from '@/shared/ui/TheButton'
import { Placeholder } from '@/shared/ui/Placeholder'
import { Separator } from '@/shared/ui/Separator'
import { TaskRow } from '@/widgets/task/ui/TaskRow'
import { SwipeableTaskRow } from '@/widgets/task/ui/SwipeableTaskRow'
import type { AllTasksScreenProps } from './model'
import type { AgendaCell } from './agenda-cells'

type Props = Pick<
    AllTasksScreenProps,
    | 'statuses'
    | 'groups'
    | 'priorities'
    | 'useGroups'
    | 'usePriority'
    | 'onAddTask'
    | 'onOpenTask'
    | 'onCompleteTask'
    | 'onDeleteTask'
    | 'onAdvanceStatus'
> & {
    cell: AgendaCell
    today: string
    tomorrow: string
    completed: ReadonlySet<string>
    onSort: (date: string, field: TaskSort['field']) => void
    onFilter: (date: string, group: GroupFilterSelection) => void
}

export const AgendaCellView = memo(function AgendaCellView({
    cell,
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
}: Props) {
    useLanguage()

    const { colors } = useTheme()
    if (cell.type === 'header') {
        const { day, preferences } = cell
        const sortItems: NativeMenuItem[] = TASK_SORT_FIELDS.filter((field) =>
            field === 'deadline'
                ? hasAnyDateData(day.tasks)
                : field === 'priority'
                  ? usePriority && hasAnyPriorityData(day.tasks)
                  : true,
        ).map((field) => ({
            key: field,
            label: TASK_SORT_FIELD_LABELS[field],
            systemImage:
                preferences.sort.direction === 'asc'
                    ? 'arrow.up'
                    : 'arrow.down',
            icon: 'arrow-up',
            iconFlipped: preferences.sort.direction === 'desc',
            isActive: preferences.sort.field === field,
            onPress: () => onSort(day.date, field),
        }))
        const filters = [
            { id: 'all', label: t('Все') },
            ...groups,
            { id: 'ungrouped', label: t('Другие') },
        ]
        const filterItems: NativeMenuItem[] = filters.map((group) => ({
            key: group.id,
            label: group.label,
            systemImage: 'checkmark',
            icon: 'check-outline',
            isActive: preferences.group === group.id,
            onPress: () => onFilter(day.date, group.id),
        }))
        return (
            <View style={styles.header}>
                <TheText size="body" weight="600" color="labels-secondary">
                    {day.date === today
                        ? t('Сегодня')
                        : day.date === tomorrow
                          ? t('Завтра')
                          : formatShortDate(day.date)}
                </TheText>
                <View style={styles.actions}>
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
        )
    }
    if (cell.type === 'empty')
        return (
            <View
                style={[
                    styles.card,
                    styles.first,
                    styles.last,
                    styles.empty,
                    { backgroundColor: colors.backgroundGrouped.secondary },
                ]}
            >
                <Placeholder
                    title={
                        cell.filtered
                            ? t('Нет задач с этим фильтром')
                            : t('Нет задач')
                    }
                    description={
                        cell.filtered
                            ? undefined
                            : t('Можно добавить новую задачу')
                    }
                />
                {!cell.filtered && (
                    <TheButton
                        size="44"
                        variant="secondary"
                        isWide
                        view="brand"
                        onPress={() => onAddTask(cell.date)}
                    >
                        {t('Добавить')}
                    </TheButton>
                )}
            </View>
        )
    const { task, date } = cell
    const occurrenceDate = task.occurrenceDate ?? date
    const occurrenceCompleted =
        !!task.repeat && completed.has(`${task.id}:${occurrenceDate}`)
    const statusId = task.repeat
        ? (task.occurrenceStatusIds?.[occurrenceDate] ?? TODO_STATUS_ID)
        : task.statusId
    const status =
        (occurrenceCompleted
            ? statuses.find((status) => status.isCompleted)
            : undefined) ?? statuses.find((status) => status.id === statusId)
    if (!status) return null
    const open = () =>
        task.repeat ? onOpenTask(task.id, occurrenceDate) : onOpenTask(task.id)
    return (
        <View
            style={[
                styles.card,
                cell.first && styles.first,
                cell.last && styles.last,
                { backgroundColor: colors.backgroundGrouped.secondary },
            ]}
        >
            {!cell.first && <Separator offsetLeft={16} />}
            <SwipeableTaskRow
                taskId={task.id}
                instanceKey={`${date}-${task.id}`}
                isCompleted={status.isCompleted}
                onComplete={() => onCompleteTask(task.id, occurrenceDate)}
                onDelete={() => onDeleteTask(task.id)}
                onEdit={open}
            >
                <TaskRow
                    task={task}
                    status={status}
                    isOverdue={
                        task.repeat
                            ? occurrenceDate < today && !occurrenceCompleted
                            : isTaskOverdue(task, statuses, today)
                    }
                    dateLineText={resolveDateLineText(task, date)}
                    priorityLabel={resolvePriorityLabel(
                        task,
                        priorities,
                        usePriority,
                    )}
                    groupLabel={resolveGroupLabel(task, groups, useGroups)}
                    onPress={open}
                    onAdvanceStatus={() =>
                        task.repeat
                            ? onAdvanceStatus(task.id, occurrenceDate)
                            : onAdvanceStatus(task.id)
                    }
                />
            </SwipeableTaskRow>
        </View>
    )
})
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 16,
        paddingBottom: 8,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    card: { marginHorizontal: 16, overflow: 'hidden', alignItems: 'center', },
    first: { borderTopLeftRadius: 26, borderTopRightRadius: 26 },
    last: {
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        marginBottom: 16,
    },
    empty: {
        minHeight: 160,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
    },
})
