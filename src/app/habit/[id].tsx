import { t, useLanguage } from '@/shared/lib/i18n'
import { DeletedDataResponse } from '@/shared/ui/DeletedDataResponse'
import { wasDeleted } from '@/shared/lib/memory/history'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

import {
    defaultAppSettings,
    habitsRepository,
    settingsRepository,
} from '@/shared/api'
import type {
    AppSettings,
    Habit,
    HabitCategory,
    HabitCompletion,
} from '@/shared/api'
import { todayDateString } from '@/shared/lib/date'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { SkeletonWrapper } from '@/shared/ui/SkeletonWrapper'

import {
    createEmptyDraft,
    draftToCreateInput,
    habitToDraft,
    isBlankDraft,
    type HabitDraft,
} from '@/features/edit-habit'
import {
    HabitDetailScreen,
    HabitDetailSkeleton,
} from '@/screens/HabitDetailScreen'

const NEW_HABIT_ID = 'new'

export default function HabitDetailRoute() {
    useLanguage()

    const { id } = useLocalSearchParams<{ id: string }>()
    const [missing, setMissing] = useState(false)
    const isNew = id === NEW_HABIT_ID
    const router = useRouter()

    const [draft, setDraft] = useState<HabitDraft | null>(null)
    const [habit, setHabit] = useState<Habit | null>(null)
    const [categories, setCategories] = useState<HabitCategory[]>([])
    const [completions, setCompletions] = useState<HabitCompletion[]>([])
    const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)

    useEffect(() => {
        async function load() {
            const [nextCategories, nextSettings] = await Promise.all([
                habitsRepository.listCategories(),
                settingsRepository.get(),
            ])
            setCategories(nextCategories)
            setSettings(nextSettings)

            if (isNew) {
                setDraft(createEmptyDraft())
                return
            }
            const existing = await habitsRepository.get(id)
            if (!existing) {
                setMissing(true)
                return
            }
            setHabit(existing)
            setDraft(habitToDraft(existing))
            setCompletions(await habitsRepository.listCompletions(id))
        }
        void load()
    }, [id, isNew])

    function handleChange(patch: Partial<HabitDraft>) {
        setDraft((current) => (current ? { ...current, ...patch } : current))
        // Same split as the task editor: a new habit is only persisted once
        // the modal closes, editing an existing one stays fully live.
        if (!isNew) void habitsRepository.update(id, patch)
    }

    async function handleClose() {
        let created = false
        if (isNew && draft && !isBlankDraft(draft)) {
            await habitsRepository.create(draftToCreateInput(draft))
            created = true
        }
        router.back()
        if (created) {
            showAppToast(
                {
                    title: t('Привычка добавлена'),
                    description: t('Она уже в вашем списке'),
                },
                360,
            )
        }
    }

    function handleSave() {
        if (!draft || isBlankDraft(draft)) {
            showAppToast({
                title: t('Нужно ввести название'),
                description: t('Название привычки не может быть пустым'),
                animation: 'warning',
            })
            return
        }
        void handleClose()
    }

    async function handleDelete() {
        await habitsRepository.remove(id)
        router.back()
        showAppToast(
            {
                title: t('Привычка удалена'),
                description: t('Она удалена из вашего списка'),
                animation: 'done',
            },
            360,
        )
    }

    async function handleCreateCategory(input: {
        label: string
        color: HabitCategory['color'] | null
    }) {
        const created = await habitsRepository.createCategory({
            label: input.label,
            color: input.color ?? undefined,
        })
        setCategories((current) => [...current, created])
        return created
    }

    if (missing)
        return (
            <DeletedDataResponse
                fullScreen
                missing={!wasDeleted('plans-tracker.habits', id)}
            />
        )
    return (
        <SkeletonWrapper
            isLoading={!draft}
            skeleton={
                <HabitDetailSkeleton
                    isNew={isNew}
                    onClose={() => router.back()}
                />
            }
        >
            {draft && (
                <HabitDetailScreen
                    key={id}
                    draft={draft}
                    habit={habit}
                    categories={categories}
                    useCategories={settings.useHabitCategories}
                    completions={completions}
                    today={todayDateString()}
                    isNew={isNew}
                    onChange={handleChange}
                    onSetCompletion={(habitId, date, completed) => {
                        void habitsRepository
                            .setCompletion(habitId, date, completed)
                            .then(() =>
                                habitsRepository
                                    .listCompletions(habitId)
                                    .then(setCompletions),
                            )
                    }}
                    onCreateCategory={handleCreateCategory}
                    onDelete={isNew ? undefined : handleDelete}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            )}
        </SkeletonWrapper>
    )
}
