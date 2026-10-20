import { builtinLabel } from '@/shared/lib/i18n/builtin-label'
import { t, useLanguage } from '@/shared/lib/i18n'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import {
    defaultTaskStatuses,
    tasksRepository,
    type TaskStatus,
} from '@/shared/api'
import { orderTaskStatuses } from '@/shared/api/tasks/status-order'
import {
    EntityEditorSheet,
    type EntityEditorValue,
} from '@/shared/ui/EntityEditorSheet'
import {
    DragDropList,
    DragSource,
    DropZone,
} from '@/shared/ui/DragDropList/DragDropList'
import { Row } from '@/shared/ui/Row'
import { Icon } from '@/shared/ui/Icon'
import { Separator } from '@/shared/ui/Separator'
import { TheText } from '@/shared/ui/TheText'
import { Section } from '@/shared/ui/Section'
import { showAppToast } from '@/shared/lib/toast/app-toast'

export function TaskStatusSettings() {
    useLanguage()

    const [statuses, setStatuses] = useState(defaultTaskStatuses)
    const [editing, setEditing] = useState<{
        status: TaskStatus | null
    } | null>(null)
    const [busy, setBusy] = useState(false)
    useEffect(() => {
        let active = true
        const load = () => {
            void tasksRepository
                .listStatuses()
                .then((items) => {
                    if (active) setStatuses(items)
                })
                .catch(() => {})
        }
        load()
        const unsubscribe = tasksRepository.subscribe(load)
        return () => {
            active = false
            unsubscribe()
        }
    }, [])
    async function save(action: () => Promise<unknown>) {
        setEditing(null)
        setBusy(true)
        try {
            await action()
            setStatuses(await tasksRepository.listStatuses())
            setEditing(null)
        } catch {
            showAppToast({
                title: t('Не удалось сохранить статусы'),
                description: t('Попробуйте ещё раз'),
                animation: 'warning',
            })
        } finally {
            setBusy(false)
        }
    }
    function submit(value: EntityEditorValue) {
        const patch = { label: value.label, color: value.color ?? undefined }
        void save(() =>
            editing?.status
                ? tasksRepository.updateStatus(editing.status.id, patch)
                : tasksRepository.createStatus(patch),
        )
    }
    return (
        <Section
            TopElement={
                <View
                    style={{ paddingHorizontal: 16, paddingBottom: 8, gap: 4 }}
                >
                    <TheText size="body" weight="600" color="labels-secondary">
                        {t('Статусы')}
                    </TheText>
                </View>
            }
        >
            <View style={{ height: Math.min(364, statuses.length * 53) }}>
                <DragDropList
                    nestedScrollEnabled
                    onDrop={(item, target) => {
                        const ordered = orderTaskStatuses(statuses)
                        const moved = ordered.find(
                            (status) => status.id === item.id,
                        )
                        if (!moved || moved.isBuiltIn || busy) return
                        const targetIndex = ordered.findIndex(
                            (status) => status.id === target,
                        )
                        const rest = ordered.filter(
                            (status) => status.id !== item.id,
                        )
                        rest.splice(
                            Math.max(1, Math.min(rest.length - 1, targetIndex)),
                            0,
                            moved,
                        )
                        void save(() =>
                            tasksRepository.reorderStatuses(
                                rest.map((status) => status.id),
                            ),
                        )
                    }}
                >
                    {statuses.map((status, index) => (
                        <DropZone key={status.id} id={status.id}>
                            <DragSource
                                item={{
                                    id: status.id,
                                    title: builtinLabel(status),
                                    from: status.id,
                                }}
                                disabled={status.isBuiltIn || busy}
                            >
                                {index > 0 && <Separator offsetLeft={16} />}
                                <Row
                                    label={builtinLabel(status)}
                                    labelColor={
                                        status.color ?? 'labels-primary'
                                    }
                                    disabled={busy}
                                    onPress={() => setEditing({ status })}
                                    RightElement={
                                        !status.isBuiltIn ? (
                                            <Icon
                                                name="line.3.horizontal"
                                                size={20}
                                                color="labels-tertiary"
                                            />
                                        ) : undefined
                                    }
                                />
                            </DragSource>
                        </DropZone>
                    ))}
                </DragDropList>
            </View>
            <Separator offsetLeft={16} />
            <Row
                label={t('Добавить статус')}
                labelColor="brand"
                disabled={busy}
                onPress={() => setEditing({ status: null })}
            />
            {editing && (
                <EntityEditorSheet
                    title={
                        editing.status ? t('Статус задачи') : t('Новый статус')
                    }
                    allowNoColor
                    initialValue={{
                        label: editing.status?.label ?? '',
                        color:
                            (editing.status
                                ?.color as EntityEditorValue['color']) ?? null,
                    }}
                    onClose={() => setEditing(null)}
                    onSubmit={submit}
                    onDelete={
                        editing.status && !editing.status.isBuiltIn
                            ? () => {
                                  void save(() =>
                                      tasksRepository.removeStatus(
                                          editing.status!.id,
                                      ),
                                  )
                              }
                            : undefined
                    }
                />
            )}
        </Section>
    )
}
