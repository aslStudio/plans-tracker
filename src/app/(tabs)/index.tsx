import { t, useLanguage } from '@/shared/lib/i18n'
import { Alert } from 'react-native'
import { rescheduleTaskDates } from '@/entities/task/lib/reschedule-task'
import { useArchiveVersion } from '@/shared/lib/memory/archive'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import {
    defaultAppSettings,
    DONE_STATUS_ID,
    settingsRepository,
    tasksRepository,
} from '@/shared/api'
import type {
    AppSettings,
    Task,
    TaskCompletion,
    TaskGroup,
    TaskPriority,
    TaskStatus,
} from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { logError } from '@/shared/lib/diagnostics/app-logger'
import { rescheduleNotifications } from '@/features/manage-notification-settings'

import { TasksScreen } from '@/screens/TasksScreen'
import { actualizeTaskDates } from '@/entities/task'
import { SwipeableRowsCoordinatorProvider } from '@/shared/lib/swipeable-rows-coordinator'

async function loadTasks(): Promise<{
    tasks: Task[]
    taskCompletions: TaskCompletion[]
    statuses: TaskStatus[]
    groups: TaskGroup[]
    priorities: TaskPriority[]
    settings: AppSettings
}> {
    const [tasks, taskCompletions, statuses, groups, priorities, settings] =
        await Promise.all([
            tasksRepository.list(),
            tasksRepository.listAllCompletions(),
            tasksRepository.listStatuses(),
            tasksRepository.listGroups(),
            tasksRepository.listPriorities(),
            settingsRepository.get(),
        ])
    return { tasks, taskCompletions, statuses, groups, priorities, settings }
}

export default function TasksRoute() {
    const language = useLanguage()

    const router = useRouter()
    const archiveVersion = useArchiveVersion()
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([])
    const [statuses, setStatuses] = useState<TaskStatus[]>([])
    const [groups, setGroups] = useState<TaskGroup[]>([])
    const [priorities, setPriorities] = useState<TaskPriority[]>([])
    const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)
    const [isLoading, setIsLoading] = useState(true)

    // Refetches on every focus, not just mount — closing the task
    // create/edit modal (or the settings screen) returns focus here, and
    // that's exactly when a new task, an edited field, or a toggled
    // setting needs to show up.
    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            async function load() {
                const next = await loadTasks()
                setTasks(next.tasks)
                setTaskCompletions(next.taskCompletions)
                setStatuses(next.statuses)
                setGroups(next.groups)
                setPriorities(next.priorities)
                setSettings(next.settings)
                setIsLoading(false)
                void rescheduleNotifications().catch((error) =>
                    logError('notifications', 'reschedule_failed', error),
                )
            }
            void load()
            // eslint-disable-next-line react-hooks/exhaustive-deps -- The cloud revision invalidates repository reads even without navigation.
        }, [language, archiveVersion]),
    )

    async function reload() {
        const next = await loadTasks()
        setTasks(next.tasks)
        setTaskCompletions(next.taskCompletions)
        setStatuses(next.statuses)
        setGroups(next.groups)
        setPriorities(next.priorities)
        setSettings(next.settings)
    }

    return (
        <SwipeableRowsCoordinatorProvider>
            <TasksScreen
                tasks={tasks}
                taskCompletions={taskCompletions}
                statuses={statuses}
                groups={groups}
                priorities={priorities}
                useGroups={settings.useGroups}
                usePriority={settings.usePriority}
                taskDaysAhead={settings.taskDaysAhead}
                isLoading={isLoading}
                onAddTask={() => router.push('/task/new')}
                onOpenTask={(taskId, occurrenceDate) =>
                    router.push({
                        pathname: '/task/[id]',
                        params: {
                            id: taskId,
                            ...(occurrenceDate ? { date: occurrenceDate } : {}),
                        },
                    })
                }
                onCompleteTask={(taskId, occurrenceDate) => {
                    const task = tasks.find((item) => item.id === taskId)
                    if (task?.repeat && occurrenceDate) {
                        void tasksRepository
                            .toggleCompletion(taskId, occurrenceDate)
                            .then(reload)
                        return
                    }
                    void tasksRepository
                        .update(taskId, { statusId: DONE_STATUS_ID })
                        .then(reload)
                }}
                onDeleteTask={(taskId) => {
                    void tasksRepository.remove(taskId).then(() => {
                        showAppToast({
                            title: t('Задача удалена'),
                            description: t('Она удалена из вашего списка'),
                            animation: 'done',
                        })
                        return reload()
                    })
                }}
                onOpenStatistics={() =>
                    router.push({
                        pathname: '/statistics',
                        params: { kind: 'tasks' },
                    })
                }
                onOpenCalendar={() => router.push('/calendar')}
                onOpenSettings={() =>
                    router.push({
                        pathname: '/settings',
                        params: { from: 'tasks' },
                    })
                }
                onMoveTask={(taskId, date, from) => {
                    const task = tasks.find((item) => item.id === taskId)
                    if (!task) return
                    const move = async () => {
                        try {
                            await tasksRepository.update(
                                taskId,
                                rescheduleTaskDates(task, date, from),
                            )
                            await reload()
                            await rescheduleNotifications()
                            showAppToast({
                                title: t('Задача перенесена'),
                                description: t('Даты обновлены'),
                            })
                        } catch {
                            showAppToast({
                                title: t('Не удалось перенести задачу'),
                                description: t('Попробуйте ещё раз'),
                                animation: 'warning',
                            })
                        }
                    }
                    if (task.repeat)
                        Alert.alert(
                            t('Перенести расписание задачи?'),
                            t(
                                'Изменится расписание повторяющейся задачи целиком. Отметки выполнения за прошлые дни сохранятся.',
                            ),
                            [
                                { text: t('Отмена'), style: 'cancel' },
                                {
                                    text: t('Перенести'),
                                    onPress: () => {
                                        void move()
                                    },
                                },
                            ],
                        )
                    else void move()
                }}
                onActualizeTask={(taskId) => {
                    const task = tasks.find((t) => t.id === taskId)
                    if (!task) return
                    void tasksRepository
                        .update(
                            taskId,
                            actualizeTaskDates(task, todayDateString()),
                        )
                        .then(reload)
                }}
                onAdvanceStatus={(taskId, occurrenceDate) => {
                    void tasksRepository
                        .advanceStatus(taskId, occurrenceDate)
                        .then(reload)
                        .catch(() =>
                            showAppToast({
                                title: t('Не удалось изменить статус'),
                                description: t('Попробуйте ещё раз'),
                                animation: 'warning',
                            }),
                        )
                }}
            />
        </SwipeableRowsCoordinatorProvider>
    )
}
