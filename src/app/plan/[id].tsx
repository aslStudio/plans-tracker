import { t, useLanguage } from '@/shared/lib/i18n'
import { DeletedDataResponse } from '@/shared/ui/DeletedDataResponse'
import { wasDeleted } from '@/shared/lib/memory/history'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'

import {
    habitsRepository,
    tasksRepository,
    type Habit,
    type Task,
} from '@/shared/api'
import { calendarRepository } from '@/shared/api/calendar/repository'
import type { CalendarEvent } from '@/shared/api/calendar/model'
import { todayDateString } from '@/shared/lib/date'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { SkeletonWrapper } from '@/shared/ui/SkeletonWrapper'
import { EventEditor, EventEditorSkeleton } from '@/widgets/calendar'
import { emptyEvent } from '@/entities/calendar-event'

export default function PlanEditorRoute() {
    const language = useLanguage()

    const {
        id,
        day,
        draft: serializedDraft,
    } = useLocalSearchParams<{
        id: string
        day?: string
        draft?: string
    }>()
    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])
    const [missing, setMissing] = useState(false)
    const [stored, setStored] = useState<CalendarEvent | null>(null)
    const [loading, setLoading] = useState(true)
    const initial = useMemo(() => {
        void language
        return parseDraft(serializedDraft, day)
    }, [language, serializedDraft, day])
    const isNew = id === 'new'

    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            let active = true
            void Promise.all([
                tasksRepository.list(),
                habitsRepository.list(),
                calendarRepository.list(),
            ])
                .then(([nextTasks, nextHabits, events]) => {
                    const event = events.find((item) => item.id === id)
                    if (!isNew && !event) setMissing(true)
                    if (event) setStored(event)
                    if (!active) return
                    setTasks(nextTasks)
                    setHabits(nextHabits)
                })
                .finally(() => {
                    if (active) setLoading(false)
                })
            return () => {
                active = false
            }
        }, [language, id, isNew]),
    )

    if (missing)
        return (
            <DeletedDataResponse
                fullScreen
                missing={!wasDeleted('plans-tracker.calendar-events', id)}
            />
        )
    return (
        <SkeletonWrapper
            isLoading={loading}
            skeleton={
                <EventEditorSkeleton
                    isNew={isNew}
                    onClose={() => router.back()}
                />
            }
        >
            <EventEditor
                initial={serializedDraft ? initial : (stored ?? initial)}
                tasks={tasks}
                habits={habits}
                onClose={() => router.back()}
                onSave={async (event) => {
                    await calendarRepository.save({
                        ...event,
                        id: isNew ? '' : event.id,
                    })
                    router.back()
                    if (isNew) {
                        showAppToast({
                            title: t('План добавлен'),
                            description: t('Он уже появился в календаре'),
                        })
                    }
                }}
                onDelete={async (onlyOccurrence) => {
                    if (onlyOccurrence) {
                        await calendarRepository.save({
                            ...initial,
                            excludedDates: [
                                ...new Set([
                                    ...initial.excludedDates,
                                    day ?? initial.date,
                                ]),
                            ],
                        })
                    } else {
                        await calendarRepository.remove(initial.id)
                    }
                    router.back()
                    showAppToast({
                        title: t('План удалён'),
                        description: t('Он удалён из календаря'),
                        animation: 'done',
                    })
                }}
                onOpenLink={(link) => {
                    router.push(
                        link.type === 'task'
                            ? `/task/${link.id}`
                            : `/habit/${link.id}`,
                    )
                }}
            />
        </SkeletonWrapper>
    )
}

function parseDraft(serializedDraft?: string, day?: string): CalendarEvent {
    if (serializedDraft) {
        try {
            return JSON.parse(serializedDraft) as CalendarEvent
        } catch {
            // Fall back to a valid empty draft if a route was opened without valid params.
        }
    }
    return emptyEvent(day ?? todayDateString())
}
