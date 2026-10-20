import { t, useLanguage } from '@/shared/lib/i18n'
import {
    RequiredTitleInput,
    useRequiredTitle,
} from '@/shared/ui/RequiredTitleInput/use-required-title'
import { RepeatFields } from '@/widgets/calendar/ui/RepeatFields'
import { ScheduleTime } from '@/shared/ui/ScheduleTime'
import { useRef, useState } from 'react'
import { ScrollView, TextInput, View } from 'react-native'
import type { SFSymbol } from 'sf-symbols-typescript'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { AppHeader } from '@/shared/ui/AppHeader'
import type { NativeMenuItem } from '@/shared/ui/NativeMenu'
import { PropertyRow } from '@/shared/ui/PropertyRow'
import {
    RichTextEditorContent,
    useRichTextEditor,
} from '@/shared/ui/RichTextEditor'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Separator } from '@/shared/ui/Separator'
import { Section } from '@/shared/ui/Section'
import { ChoiceSection } from '@/shared/ui/ChoiceSection'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { buildTextStyle, resolveTextColor, TheText } from '@/shared/ui/TheText'

import type { HabitDetailScreenProps } from './model'
import { useStyles } from './styles'
import { HabitMonthProgress } from '@/widgets/habit'

const CHECKMARK: SFSymbol = 'checkmark'

export function HabitDetailScreen({
    draft,
    habit,
    categories,
    useCategories,
    completions,
    today,
    isNew,
    onChange,
    onCreateCategory,
    onSetCompletion,
    onDelete,
    onClose,
    onSave,
}: HabitDetailScreenProps) {
    useLanguage()

    const styles = useStyles()
    const theme = useTheme()
    const [confirmDelete, setConfirmDelete] = useState(false)
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
    } = useRequiredTitle(draft.title, t('Добавьте название привычки'))

    const scrollRef = useRef<ScrollView>(null)
    const richTextEditor = useRichTextEditor({
        initialContent: draft.description,
        placeholder: t('Описание'),
        onChange: (description) => onChange({ description }),
    })

    const isCompletedToday = completions.some(
        (completion) => completion.occurrenceDate === today,
    )

    const statusItems: NativeMenuItem[] = [
        {
            key: 'completed',
            label: t('Выполнено'),
            systemImage: CHECKMARK,
            icon: 'check-outline',
            isActive: isCompletedToday,
            onPress: () => habit && onSetCompletion(habit.id, today, true),
        },
        {
            key: 'not-completed',
            label: t('Не выполнено'),
            systemImage: CHECKMARK,
            icon: 'check-outline',
            isActive: !isCompletedToday,
            onPress: () => habit && onSetCompletion(habit.id, today, false),
        },
    ]

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
                            accessibilityLabel={t('Удалить привычку')}
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

                {!isNew && habit && (
                    <Section paddingBottom={8}>
                        <PropertyRow
                            label={t('Статус')}
                            valueLabel={
                                isCompletedToday
                                    ? t('Выполнено')
                                    : t('Не выполнено')
                            }
                            valueColor={isCompletedToday ? 'brand' : undefined}
                            items={statusItems}
                        />
                    </Section>
                )}
                {useCategories && (
                    <ChoiceSection
                        title={t('Категория')}
                        creation={{
                            title: t('Новая категория'),
                            allowNoColor: true,
                            onSubmit: onCreateCategory,
                        }}
                        emptyLabel={t('Без категории')}
                        toggleable
                        options={[...categories].sort(
                            (a, b) => a.order - b.order,
                        )}
                        value={draft.categoryId}
                        onChange={(categoryId) => onChange({ categoryId })}
                    />
                )}
                <Section paddingBottom={8}>
                    <RepeatFields
                        repeat={draft.repeat}
                        date={habit?.createdAt.slice(0, 10) ?? today}
                        allowOnce={false}
                        onChange={(repeat) => {
                            if (repeat) onChange({ repeat })
                        }}
                    />
                </Section>
                <Section paddingBottom={8}>
                    <ScheduleTime
                        minute={draft.startMinute ?? null}
                        duration={draft.durationMinutes ?? 60}
                        onChange={(startMinute, durationMinutes) =>
                            onChange({ startMinute, durationMinutes })
                        }
                    />
                </Section>

                <Section paddingBottom={8}>
                    <RichTextEditorContent controller={richTextEditor} />
                </Section>

                {!isNew && habit && (
                    <Section
                        paddingBottom={8}
                        TopElement={
                            <View style={styles.progressTitle}>
                                <TheText
                                    size="body"
                                    weight="600"
                                    color="labels-secondary"
                                >
                                    {t('Прогресс')}
                                </TheText>
                            </View>
                        }
                    >
                        <View style={styles.progressContent}>
                            <HabitMonthProgress
                                habit={habit}
                                completions={completions}
                                today={today}
                            />
                        </View>
                    </Section>
                )}
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
