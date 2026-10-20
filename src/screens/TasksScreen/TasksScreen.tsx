import { t, useLanguage } from '@/shared/lib/i18n'
import { DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'
import { DragDropList } from '@/shared/ui/DragDropList/DragDropList'
import { SectionIntro } from '@/widgets/section-intro/SectionIntro'
import Animated from 'react-native-reanimated'
import { listLayout } from '@/shared/lib/motion'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

import {
    formatShortDate,
    todayDateString,
    tomorrowDateString,
} from '@/shared/lib/date'
import { AppHeader } from '@/shared/ui/AppHeader'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { logError } from '@/shared/lib/diagnostics/app-logger'

import {
    groupTasksByDay,
    computeTaskProgress,
    resolveNextStatusId,
} from '@/entities/task'
import { claimOverdueReminderForDay } from '@/features/remind-overdue-tasks'
import {
    DaySection,
    OverdueTasksReminder,
    TasksCompletionCelebration,
    TasksCompletionChart,
    TasksProgressSummary,
} from '@/widgets/task'
import type { TasksScreenProps } from './model'
import { Skeleton } from './Skeleton'
import { useStyles } from './styles'

export function TasksScreen({
    tasks,
    taskCompletions = [],
    statuses,
    groups,
    priorities,
    useGroups,
    usePriority,
    taskDaysAhead = 1,
    isLoading,
    onAddTask,
    onOpenTask,
    onCompleteTask,
    onDeleteTask,
    onOpenCalendar,
    onOpenStatistics,
    onOpenSettings,
    onActualizeTask,
    onAdvanceStatus,
    onMoveTask,
}: TasksScreenProps) {
    useLanguage()

    const styles = useStyles()
    const today = todayDateString()
    const tomorrow = tomorrowDateString()
    const dayGroups = groupTasksByDay(
        tasks,
        statuses,
        today,
        taskDaysAhead,
        taskCompletions,
    )
    const progress = computeTaskProgress(
        dayGroups,
        statuses,
        taskCompletions,
        today,
    )
    const allDueTasksComplete =
        progress.total > 0 && progress.done >= progress.total
    const [showCelebration, setShowCelebration] = useState(false)
    const [showOverdueReminder, setShowOverdueReminder] = useState(false)
    const overdueReminderCheckedDay = useRef<string | null>(null)
    const wasAllDueTasksComplete = useRef<boolean | null>(null)
    const pendingCompletion = useRef(false)

    useEffect(() => {
        if (isLoading || overdueReminderCheckedDay.current === today) return
        overdueReminderCheckedDay.current = today
        if (dayGroups.overdue.length === 0) return

        void claimOverdueReminderForDay(today)
            .then((shouldShow) => {
                if (shouldShow) setShowOverdueReminder(true)
            })
            .catch((error: unknown) => {
                void logError('tasks', 'overdue_reminder_check_failed', error)
                setShowOverdueReminder(true)
            })
    }, [isLoading, today, dayGroups.overdue.length])

    useEffect(() => {
        if (isLoading) return

        const wasComplete = wasAllDueTasksComplete.current
        if (wasComplete === null) {
            wasAllDueTasksComplete.current = allDueTasksComplete
            return
        }

        if (pendingCompletion.current && !wasComplete && allDueTasksComplete) {
            setShowCelebration(true)
            pendingCompletion.current = false
        }

        wasAllDueTasksComplete.current = allDueTasksComplete
    }, [isLoading, allDueTasksComplete])

    function completeTask(taskId: string, occurrenceDate?: string) {
        const task = tasks.find((item) => item.id === taskId)
        const alreadyComplete = task?.repeat
            ? taskCompletions.some(
                  (completion) =>
                      completion.taskId === taskId &&
                      completion.occurrenceDate === occurrenceDate,
              )
            : statuses.find((status) => status.id === task?.statusId)
                  ?.isCompleted
        pendingCompletion.current = !alreadyComplete
        onCompleteTask(taskId, occurrenceDate)
    }

    function advanceTaskStatus(taskId: string, occurrenceDate?: string) {
        const task = tasks.find((item) => item.id === taskId)
        const nextStatusId = task
            ? resolveNextStatusId(
                  task.repeat && occurrenceDate
                      ? taskCompletions.some(
                            (item) =>
                                item.taskId === taskId &&
                                item.occurrenceDate === occurrenceDate,
                        )
                          ? DONE_STATUS_ID
                          : (task.occurrenceStatusIds?.[occurrenceDate] ??
                            TODO_STATUS_ID)
                      : task.statusId,
                  statuses,
              )
            : null
        if (
            statuses.find((status) => status.id === nextStatusId)?.isCompleted
        ) {
            pendingCompletion.current = true
        }
        if (occurrenceDate) onAdvanceStatus(taskId, occurrenceDate)
        else onAdvanceStatus(taskId)
    }

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                LeftItem={
                    <TheText size="title-1" weight="700">
                        {t('Задачи')}
                    </TheText>
                }
                RightItem={
                    <View style={styles.headerActions}>
                        <TheButton size="36" onPress={onOpenCalendar}>
                            {t('Все задачи')}
                        </TheButton>
                        <TheButtonIcon
                            icon="plus"
                            size="36"
                            accessibilityLabel={t('Добавить задачу')}
                            onPress={onAddTask}
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
            <DragDropList
                onDrop={(item, date) => {
                    if (date !== 'overdue' && date !== 'backlog')
                        onMoveTask?.(item.id, date, item.from)
                }}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <Skeleton />
                ) : tasks.length === 0 ? (
                    <SectionIntro section="tasks" onCreate={onAddTask} />
                ) : (
                    <>
                        <TasksProgressSummary
                            groups={dayGroups}
                            statuses={statuses}
                            completions={taskCompletions}
                            today={today}
                        />
                        <DaySection
                            sectionKey="overdue"
                            title={t('Просроченные')}
                            tasks={dayGroups.overdue}
                            completions={taskCompletions}
                            dayDate={today}
                            statuses={statuses}
                            groups={groups}
                            priorities={priorities}
                            useGroups={useGroups}
                            usePriority={usePriority}
                            today={today}
                            alwaysShow={false}
                            onOpenTask={onOpenTask}
                            onCompleteTask={completeTask}
                            onDeleteTask={onDeleteTask}
                            onAddTask={onAddTask}
                            onActualizeTask={onActualizeTask}
                            onAdvanceStatus={advanceTaskStatus}
                        />
                        <DaySection
                            sectionKey="today"
                            title={t('Сегодня')}
                            tasks={dayGroups.today}
                            completions={taskCompletions}
                            dayDate={today}
                            statuses={statuses}
                            groups={groups}
                            priorities={priorities}
                            useGroups={useGroups}
                            usePriority={usePriority}
                            today={today}
                            alwaysShow
                            onOpenTask={onOpenTask}
                            onCompleteTask={completeTask}
                            onDeleteTask={onDeleteTask}
                            onAddTask={onAddTask}
                            onActualizeTask={onActualizeTask}
                            onAdvanceStatus={advanceTaskStatus}
                        />
                        <DaySection
                            sectionKey="tomorrow"
                            title={t('Завтра')}
                            tasks={dayGroups.tomorrow}
                            completions={taskCompletions}
                            dayDate={tomorrow}
                            statuses={statuses}
                            groups={groups}
                            priorities={priorities}
                            useGroups={useGroups}
                            usePriority={usePriority}
                            today={today}
                            alwaysShow
                            onOpenTask={onOpenTask}
                            onCompleteTask={completeTask}
                            onDeleteTask={onDeleteTask}
                            onAddTask={onAddTask}
                            onActualizeTask={onActualizeTask}
                            onAdvanceStatus={advanceTaskStatus}
                        />
                        {dayGroups.future.map((day) => (
                            <DaySection
                                key={day.date}
                                sectionKey={`future-${day.date}`}
                                title={formatShortDate(day.date)}
                                tasks={day.tasks}
                                completions={taskCompletions}
                                dayDate={day.date}
                                statuses={statuses}
                                groups={groups}
                                priorities={priorities}
                                useGroups={useGroups}
                                usePriority={usePriority}
                                today={today}
                                alwaysShow
                                onOpenTask={onOpenTask}
                                onCompleteTask={completeTask}
                                onDeleteTask={onDeleteTask}
                                onAddTask={onAddTask}
                                onActualizeTask={onActualizeTask}
                                onAdvanceStatus={advanceTaskStatus}
                            />
                        ))}
                        <DaySection
                            sectionKey="backlog"
                            title={t('Бэклог')}
                            tasks={dayGroups.backlog}
                            completions={taskCompletions}
                            dayDate={tomorrow}
                            statuses={statuses}
                            groups={groups}
                            priorities={priorities}
                            useGroups={useGroups}
                            usePriority={usePriority}
                            today={today}
                            alwaysShow={false}
                            onOpenTask={onOpenTask}
                            onCompleteTask={completeTask}
                            onDeleteTask={onDeleteTask}
                            onAddTask={onAddTask}
                            onActualizeTask={onActualizeTask}
                            onAdvanceStatus={advanceTaskStatus}
                        />

                        {tasks.length > 0 && (
                            <Animated.View layout={listLayout}>
                                <TasksCompletionChart
                                    onPress={onOpenStatistics}
                                    tasks={tasks}
                                    statuses={statuses}
                                    completions={taskCompletions}
                                    today={today}
                                />
                            </Animated.View>
                        )}
                    </>
                )}
            </DragDropList>
            <TasksCompletionCelebration
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
            />
            <OverdueTasksReminder
                visible={showOverdueReminder}
                onClose={() => setShowOverdueReminder(false)}
            />
        </View>
    )
}
