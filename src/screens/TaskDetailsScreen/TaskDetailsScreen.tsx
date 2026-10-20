import { builtinLabel } from '@/shared/lib/i18n/builtin-label'
import { t, useLanguage } from '@/shared/lib/i18n'
import {
    RequiredTitleInput,
    useRequiredTitle,
} from '@/shared/ui/RequiredTitleInput/use-required-title'
import { orderTaskStatuses } from '@/shared/api/tasks/status-order'
import { RepeatFields } from '@/widgets/calendar/ui/RepeatFields'
import { ScheduleTime } from '@/shared/ui/ScheduleTime/ScheduleTime'
import { todayDateString } from '@/shared/lib/date'
import { useRef, useState } from 'react'
import { TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { AppHeader } from '@/shared/ui/AppHeader'
import { TaskChoiceSection } from './TaskChoiceSection'
import {
    RichTextEditorContent,
    useRichTextEditor,
} from '@/shared/ui/RichTextEditor'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { buildTextStyle, resolveTextColor } from '@/shared/ui/TheText'

import type { TaskDetailsScreenProps } from './model'
import { useStyles } from './styles'
import { DateWheelRow } from '@/widgets/calendar'

export function TaskDetailsScreen({
    draft,
    statuses,
    groups,
    priorities,
    useGroups,
    usePriority,
    onChange,
    onCreateGroup,
    onCreatePriority,
    onDelete,
    onClose,
    onSave,
}: TaskDetailsScreenProps) {
    useLanguage()

    const scrollRef = useRef<ScrollView>(null)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const styles = useStyles()
    const theme = useTheme()
    const titleTextStyle = buildTextStyle({
        weight: '700',
        size: 'title-1',
        color: resolveTextColor(theme.colors, 'labels-primary'),
    })
    const {
        inputRef,
        validate: validateTitle,
        animatedStyle: titleAnimation,
        placeholderColor: titlePlaceholderColor,
    } = useRequiredTitle(draft.title, t('Добавьте название задачи'))

    const richTextEditor = useRichTextEditor({
        initialContent: draft.description,
        placeholder: t('Описание'),
        onChange: (description) => onChange({ description }),
    })

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                LeftItem={
                    onDelete && (
                        <TheButtonIcon
                            icon="trash"
                            size="36"
                            view="grouped"
                            accessibilityLabel={t('Удалить задачу')}
                            onPress={() => setConfirmDelete(true)}
                        />
                    )
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
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
            >
                <Section paddingBottom={8}>
                    <RequiredTitleInput
                        ref={inputRef}
                        value={draft.title}
                        onChangeText={(title) =>
                            onChange({
                                title: title.replace(
                                    /[\r\n\u2028\u2029]+/g,
                                    ' ',
                                ),
                            })
                        }
                        placeholder={t('Название')}
                        accessibilityLabel={t('Название')}
                        selectionColor={theme.colors.brand}
                        placeholderTextColor={titlePlaceholderColor}
                        multiline
                        scrollEnabled={false}
                        returnKeyType="done"
                        submitBehavior="blurAndSubmit"
                        style={[
                            titleTextStyle,
                            styles.titleInput,
                            titleAnimation,
                        ]}
                    />
                    <Separator offsetLeft={16} />
                    <TextInput
                        value={draft.note ?? ''}
                        onChangeText={(note) =>
                            onChange({
                                note: note.replace(/[\r\n\u2028\u2029]+/g, ' '),
                            })
                        }
                        placeholder={t('Заметка/ссылка')}
                        accessibilityLabel={t('Заметка/ссылка')}
                        placeholderTextColor={theme.colors.labels.tertiary}
                        selectionColor={theme.colors.brand}
                        multiline
                        scrollEnabled={false}
                        returnKeyType="done"
                        submitBehavior="blurAndSubmit"
                        autoCapitalize="sentences"
                        style={styles.noteInput}
                    />
                </Section>

                <Section paddingBottom={8}>
                    <DateWheelRow
                        label={t('Дата начала')}
                        value={draft.startDate}
                        onChange={(startDate) => onChange({ startDate })}
                    />
                    <Separator offsetLeft={16} />
                    <DateWheelRow
                        label={t('Дата окончания')}
                        value={draft.endDate}
                        onChange={(endDate) => onChange({ endDate })}
                    />
                </Section>

                {statuses.length > 0 && (
                    <TaskChoiceSection
                        title={t('Статус')}
                        options={orderTaskStatuses(statuses).map((item) => ({
                            ...item,
                            label: builtinLabel(item),
                        }))}
                        value={draft.statusId}
                        onChange={(statusId) => {
                            if (statusId !== null) onChange({ statusId })
                        }}
                    />
                )}
                {usePriority && (priorities.length > 0 || onCreatePriority) && (
                    <TaskChoiceSection
                        title={t('Приоритет')}
                        creation={
                            onCreatePriority
                                ? {
                                      title: t('Новый приоритет'),
                                      allowNoColor: true,
                                      onSubmit: onCreatePriority,
                                  }
                                : undefined
                        }
                        emptyLabel={t('Без приоритета')}
                        toggleable
                        options={priorities
                            .map((item) => ({
                                ...item,
                                label: builtinLabel(item),
                            }))
                            .sort((a, b) => a.order - b.order)}
                        value={draft.priorityId}
                        onChange={(priorityId) => onChange({ priorityId })}
                    />
                )}

                <Section paddingBottom={8}>
                    <RichTextEditorContent controller={richTextEditor} />
                </Section>

                {useGroups && (groups.length > 0 || onCreateGroup) && (
                    <TaskChoiceSection
                        title={t('Группа')}
                        creation={
                            onCreateGroup
                                ? {
                                      title: t('Новая группа'),
                                      allowNoColor: false,
                                      onSubmit: onCreateGroup,
                                  }
                                : undefined
                        }
                        emptyLabel={t('Без группы')}
                        toggleable
                        options={[...groups].sort((a, b) => a.order - b.order)}
                        value={draft.groupId}
                        onChange={(groupId) => onChange({ groupId })}
                    />
                )}

                <Section paddingBottom={8}>
                    <RepeatFields
                        toggleSelection
                        repeat={draft.repeat}
                        date={
                            draft.startDate ??
                            draft.endDate ??
                            todayDateString()
                        }
                        onChange={(repeat) =>
                            onChange({
                                repeat,
                                ...(repeat && !draft.startDate
                                    ? {
                                          startDate:
                                              draft.endDate ??
                                              todayDateString(),
                                      }
                                    : {}),
                            })
                        }
                    />
                </Section>

                <Section paddingBottom={8}>
                    <ScheduleTime
                        minute={draft.startMinute ?? null}
                        duration={draft.durationMinutes ?? 60}
                        onChange={(startMinute, durationMinutes) =>
                            onChange({
                                startMinute,
                                durationMinutes,
                                ...(startMinute != null && !draft.startDate
                                    ? {
                                          startDate: todayDateString(),
                                          endDate:
                                              draft.endDate ??
                                              todayDateString(),
                                      }
                                    : {}),
                            })
                        }
                    />
                </Section>
            </ScrollView>
            <View style={styles.floatingSaveButton}>
                <TheButton
                    size="52"
                    variant="primary"
                    view="brand"
                    isWide
                    onPress={() => {
                        if (!validateTitle()) {
                            scrollRef.current?.scrollTo({
                                y: 0,
                                animated: true,
                            })
                            return
                        }
                        onSave()
                    }}
                >
                    {t('Сохранить')}
                </TheButton>
            </View>
            <DeleteConfirmationSheet
                visible={confirmDelete}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() => {
                    setConfirmDelete(false)
                    onDelete?.()
                }}
            />
        </View>
    )
}
