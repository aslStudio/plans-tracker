import { t, useLanguage } from '@/shared/lib/i18n'
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
import { actualizeTaskDates } from '@/entities/task'
import { todayDateString } from '@/shared/lib/date'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { SwipeableRowsCoordinatorProvider } from '@/shared/lib/swipeable-rows-coordinator'

import { AllTasksScreen } from '@/screens/AllTasksScreen'

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

export default function CalendarRoute() {
    const language = useLanguage()

    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([])
    const [statuses, setStatuses] = useState<TaskStatus[]>([])
    const [groups, setGroups] = useState<TaskGroup[]>([])
    const [priorities, setPriorities] = useState<TaskPriority[]>([])
    const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)

    const [isLoading, setIsLoading] = useState(true)

    const reload = useCallback(async () => {
        // Recompute localized values when the app language changes.
        void language

        try {
            const next = await loadTasks()
            setTasks(next.tasks)
            setTaskCompletions(next.taskCompletions)
            setStatuses(next.statuses)
            setGroups(next.groups)
            setPriorities(next.priorities)
            setSettings(next.settings)
        } catch {
            showAppToast({
                title: t('Не удалось загрузить задачи'),
                description: t('Попробуйте открыть список ещё раз'),
                animation: 'warning',
            })
        } finally {
            setIsLoading(false)
        }
    }, [language])

    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            void reload()
        }, [language, reload]),
    )

    return (
        <SwipeableRowsCoordinatorProvider>
            <AllTasksScreen
                isLoading={isLoading}
                tasks={tasks}
                taskCompletions={taskCompletions}
                statuses={statuses}
                groups={groups}
                priorities={priorities}
                useGroups={settings.useGroups}
                usePriority={settings.usePriority}
                onClose={() => router.back()}
                onAddTask={(date) => router.push(`/task/new?date=${date}`)}
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
                onActualizeTask={(taskId) => {
                    const task = tasks.find((item) => item.id === taskId)
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
