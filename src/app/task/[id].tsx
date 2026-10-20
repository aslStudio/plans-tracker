import { t, useLanguage } from '@/shared/lib/i18n'
import { DeletedDataResponse } from '@/shared/ui/DeletedDataResponse'
import { wasDeleted } from '@/shared/lib/memory/history'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'

import {
    defaultAppSettings,
    settingsRepository,
    tasksRepository,
} from '@/shared/api'
import type {
    AppSettings,
    TaskGroup,
    TaskPriority,
    TaskStatus,
} from '@/shared/api'
import { formatShortDate, todayDateString } from '@/shared/lib/date'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { SkeletonWrapper } from '@/shared/ui/SkeletonWrapper'

import {
    normalizeTaskDraftPatch,
    createEmptyDraft,
    draftToCreateInput,
    isBlankDraft,
    taskToDraft,
    TaskDetailsScreen,
    TaskDetailsSkeleton,
    type TaskDraft,
} from '@/screens/TaskDetailsScreen'

const NEW_TASK_ID = 'new'

export default function TaskDetailsRoute() {
    useLanguage()

    const { id, date } = useLocalSearchParams<{ id: string; date?: string }>()
    const [missing, setMissing] = useState(false)
    const isNew = id === NEW_TASK_ID
    const router = useRouter()
    const saving = useRef(false)
    const edited = useRef(false)
    const adjustedEndDate = useRef<string | null>(null)
    const [fallbackDate] = useState(todayDateString)
    const occurrenceDate = date ?? fallbackDate

    function close() {
        if (router.canGoBack()) router.back()
        else router.replace('/')
    }

    const [draft, setDraft] = useState<TaskDraft | null>(null)
    const [statuses, setStatuses] = useState<TaskStatus[]>([])
    const [groups, setGroups] = useState<TaskGroup[]>([])
    const [priorities, setPriorities] = useState<TaskPriority[]>([])
    const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)

    useEffect(() => {
        edited.current = false
        adjustedEndDate.current = null
        async function load() {
            const [nextStatuses, nextGroups, nextPriorities, nextSettings] =
                await Promise.all([
                    tasksRepository.listStatuses(),
                    tasksRepository.listGroups(),
                    tasksRepository.listPriorities(),
                    settingsRepository.get(),
                ])
            setStatuses(nextStatuses)
            setGroups(nextGroups)
            setPriorities(nextPriorities)
            setSettings(nextSettings)

            if (isNew) {
                setDraft(createEmptyDraft(date ?? null))
                return
            }
            const task = await tasksRepository.get(id)
            if (task)
                setDraft(
                    taskToDraft(
                        task,
                        occurrenceDate,
                        task.repeat
                            ? await tasksRepository.listCompletions(id)
                            : [],
                    ),
                )
            else setMissing(true)
        }
        void load()
    }, [id, isNew, date, occurrenceDate])

    function handleChange(patch: Partial<TaskDraft>) {
        if (!draft) return
        const normalized = normalizeTaskDraftPatch(draft, patch)
        if (patch.endDate !== undefined) adjustedEndDate.current = null
        if (normalized.endDate !== patch.endDate)
            adjustedEndDate.current = normalized.endDate ?? null
        edited.current = true
        setDraft({ ...draft, ...normalized })
        // A new task is only persisted once the modal closes — a live
        // `update` call has nowhere to write to yet. Editing an existing one
        // stays fully live, same as every other field on it.
        if (!isNew)
            void tasksRepository
                .updateOccurrence(id, occurrenceDate, normalized)
                .catch(() =>
                    Alert.alert(
                        t('Не удалось сохранить задачу'),
                        t(
                            'Изменения остались в форме. Нажмите «Сохранить», чтобы повторить.',
                        ),
                    ),
                )
    }

    async function handleClose() {
        if (saving.current) return
        saving.current = true
        try {
            let created = false
            let updated = false
            if (draft && !isBlankDraft(draft)) {
                if (isNew) {
                    await tasksRepository.create(draftToCreateInput(draft))
                    created = true
                } else {
                    await tasksRepository.updateOccurrence(
                        id,
                        occurrenceDate,
                        draftToCreateInput(draft),
                    )
                    updated = edited.current
                }
            }
            close()
            if (created || updated)
                showAppToast(
                    {
                        title: created
                            ? t('Задача добавлена')
                            : t('Задача обновлена'),
                        description:
                            adjustedEndDate.current &&
                            adjustedEndDate.current === draft?.endDate
                                ? t('Дата окончания также перенесена на {0}', [
                                      formatShortDate(adjustedEndDate.current),
                                  ])
                                : created
                                  ? t('Она уже в вашем списке')
                                  : t('Изменения сохранены'),
                        animation: created ? 'plus' : 'done',
                    },
                    360,
                )
        } catch {
            saving.current = false
            Alert.alert(
                t('Не удалось сохранить задачу'),
                t('Попробуйте ещё раз. Изменения остались в форме.'),
            )
        }
    }

    function handleSave() {
        if (!draft || isBlankDraft(draft)) {
            showAppToast({
                title: t('Нужно ввести название'),
                description: t('Название задачи не может быть пустым'),
                animation: 'warning',
            })
            return
        }
        void handleClose()
    }

    async function handleDelete() {
        await tasksRepository.remove(id)
        close()
        showAppToast(
            {
                title: t('Задача удалена'),
                description: t('Она удалена из вашего списка'),
                animation: 'done',
            },
            360,
        )
    }

    if (missing)
        return (
            <DeletedDataResponse
                fullScreen
                missing={!wasDeleted('plans-tracker.tasks', id)}
            />
        )
    return (
        <SkeletonWrapper
            isLoading={!draft}
            skeleton={<TaskDetailsSkeleton onClose={close} />}
        >
            {draft && (
                <TaskDetailsScreen
                    key={id}
                    draft={draft}
                    statuses={statuses}
                    groups={groups}
                    priorities={priorities}
                    useGroups={settings.useGroups}
                    usePriority={settings.usePriority}
                    useTaskRecurrence={settings.taskRecurrenceEnabled}
                    useTaskTime={settings.taskTimeEnabled}
                    isNew={isNew}
                    onChange={handleChange}
                    onCreateGroup={async ({ label, color }) => {
                        const created = await tasksRepository.createGroup({
                            label,
                            color: color ?? 'accent-blue',
                        })
                        setGroups((current) => [...current, created])
                        return created
                    }}
                    onCreatePriority={async ({ label, color }) => {
                        const created = await tasksRepository.createPriority({
                            label,
                            color: color ?? undefined,
                        })
                        setPriorities((current) => [...current, created])
                        return created
                    }}
                    onDelete={isNew ? undefined : handleDelete}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            )}
        </SkeletonWrapper>
    )
}
