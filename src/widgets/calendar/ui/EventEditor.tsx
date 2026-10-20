import { getLocale, t, useLanguage } from '@/shared/lib/i18n'
import {
    RequiredTitleInput,
    useRequiredTitle,
} from '@/shared/ui/RequiredTitleInput/use-required-title'
import { eventDescription } from '@/entities/calendar-event/lib/description'
import {
    RichTextEditorContent,
    useRichTextEditor,
} from '@/shared/ui/RichTextEditor'
import { RepeatFields, repeatLabel } from './RepeatFields'
import { useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { Collapsible } from '@/shared/ui/Collapsible'
import type { Habit, Task } from '@/shared/api'
import type { CalendarEvent } from '@/shared/api/calendar/model'
import { AccentColorValues, type AccentColor } from '@/shared/config/color'
import { parseLocalDateString } from '@/shared/lib/date'
import { occursOn, timeLabel, validateEvent } from '@/entities/calendar-event'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { TheText, buildTextStyle, resolveTextColor } from '@/shared/ui/TheText'
import { Section } from '@/shared/ui/Section'
import { Row } from '@/shared/ui/Row'
import { Separator } from '@/shared/ui/Separator'
import { Toggle } from '@/shared/ui/Toggle'
import { Icon } from '@/shared/ui/Icon'
import { AppHeader } from '@/shared/ui/AppHeader'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { AccentColorPicker } from '@/shared/ui/AccentColorPicker'
import { CalendarDateModal } from './CalendarDateModal'
import { CalendarTimeModal } from './CalendarTimeModal'
import { useStyles } from './EventEditor.styles'

const dateLabel = (date: string) =>
    parseLocalDateString(date).toLocaleDateString(getLocale(), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
type EventEditorProps = {
    visible?: boolean
    sessionKey?: number
    initial: CalendarEvent
    tasks: Task[]
    habits: Habit[]
    onSave: (event: CalendarEvent) => Promise<void>
    onClose: () => void
    onDelete: (onlyOccurrence: boolean) => Promise<void>
    onOpenLink: (
        link: NonNullable<CalendarEvent['link']>,
        draft: CalendarEvent,
    ) => void
}

export function EventEditor({
    visible = true,
    sessionKey = 0,
    initial,
    tasks,
    habits,
    onSave,
    onClose,
    onDelete,
    onOpenLink,
}: EventEditorProps) {
    if (!visible) return null

    return (
        <EventEditorForm
            key={sessionKey}
            initial={initial}
            tasks={tasks}
            habits={habits}
            onSave={onSave}
            onClose={onClose}
            onDelete={onDelete}
            onOpenLink={onOpenLink}
            parentVisible={visible}
        />
    )
}

function EventEditorForm({
    initial,
    tasks,
    habits,
    onSave,
    onClose,
    onDelete,
    onOpenLink,
    parentVisible,
}: Omit<EventEditorProps, 'visible' | 'sessionKey'> & {
    parentVisible: boolean
}) {
    const language = useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const [draft, setDraft] = useState(() => ({
        ...initial,
        description: eventDescription(initial),
    }))
    const scrollRef = useRef<ScrollView>(null)
    const {
        inputRef,
        validate: validateTitle,
        animatedStyle: titleAnimation,
        placeholderColor: titlePlaceholderColor,
    } = useRequiredTitle(draft.title, t('Добавьте название плана'))
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [dateModal, setDateModal] = useState<'date' | 'until' | null>(null)
    const [timeModal, setTimeModal] = useState(false)
    const [pendingDelete, setPendingDelete] = useState<boolean | null>(null)
    const [linkType, setLinkType] = useState<'task' | 'habit' | null>(null)
    const [linkDraft, setLinkDraft] = useState<CalendarEvent['link']>(
        initial.link,
    )
    const [query, setQuery] = useState('')
    const patch = (value: Partial<CalendarEvent>) =>
        setDraft((d) => ({ ...d, ...value }))
    const richTextEditor = useRichTextEditor({
        initialContent: draft.description,
        placeholder: t('Описание'),
        onChange: (description) => patch({ description }),
    })
    const linkedEntity =
        draft.link?.type === 'task'
            ? tasks.find((x) => x.id === draft.link?.id)
            : draft.link?.type === 'habit'
              ? habits.find((x) => x.id === draft.link?.id)
              : undefined
    const colorValue = (color: string) => {
        if (AccentColorValues.some((c) => c === color))
            return resolveTextColor(colors, color as AccentColor)
        if (color.startsWith('#') || color.startsWith('rgb')) return color
        return resolveTextColor(colors, 'accent-turquoise')
    }
    const selectedAccent =
        AccentColorValues.find(
            (accent) =>
                resolveTextColor(colors, accent) === colorValue(draft.color),
        ) ?? null
    const linkedList = useMemo(() => {
        // Recompute localized values when the app language changes.
        void language

        if (!linkType) return []
        if (linkType === 'task')
            return tasks.filter((task) => {
                const start =
                    task.startDate ??
                    task.endDate ??
                    task.createdAt.slice(0, 10)
                return (
                    (task.repeat
                        ? occursOn(start, task.repeat, draft.date)
                        : (!task.startDate && !task.endDate) ||
                          (start <= draft.date &&
                              draft.date <= (task.endDate ?? start))) &&
                    task.title.toLowerCase().includes(query.toLowerCase())
                )
            })
        return habits.filter(
            (habit) =>
                occursOn(
                    habit.createdAt.slice(0, 10),
                    habit.repeat,
                    draft.date,
                ) && habit.title.toLowerCase().includes(query.toLowerCase()),
        )
    }, [language, linkType, tasks, habits, draft.date, query])
    async function run(action: () => Promise<void>) {
        setBusy(true)
        setError('')
        try {
            await action()
        } catch {
            setError(t('Не удалось сохранить изменения. Попробуйте ещё раз.'))
            setBusy(false)
        }
    }
    function save() {
        if (!validateTitle()) {
            setError(t('Добавьте название'))
            scrollRef.current?.scrollTo({ y: 0, animated: true })
            return
        }
        const next = {
            ...draft,
            title: draft.title.trim(),
            color: colorValue(draft.color),
            startMinute: draft.allDay ? 0 : draft.startMinute,
            duration: draft.allDay ? 1440 : draft.duration,
        }
        const issue = validateEvent(next)
        if (issue) {
            setError(issue)
            showAppToast({
                title:
                    issue === t('Добавьте название')
                        ? t('Нужно ввести название')
                        : t('Нужно заполнить обязательные поля'),
                description: issue,
                animation: 'warning',
            })
            return
        }
        void run(() => onSave(next))
    }
    function saveLinkSelection() {
        if (!linkDraft) {
            patch({ link: null })
            setLinkType(null)
            return
        }
        if (linkDraft.type === 'task') {
            const task = tasks.find((item) => item.id === linkDraft.id)
            patch({
                link: linkDraft,
                ...(task
                    ? {
                          title: task.title,
                          repeat: task.repeat ?? null,
                          startMinute: task.startMinute ?? draft.startMinute,
                          duration: task.durationMinutes ?? draft.duration,
                      }
                    : {}),
            })
        } else {
            const habit = habits.find((item) => item.id === linkDraft.id)
            patch({
                link: linkDraft,
                ...(habit
                    ? { title: habit.title, repeat: habit.repeat ?? null }
                    : {}),
            })
        }
        setLinkType(null)
    }
    const titleStyle = buildTextStyle({
        weight: '700',
        size: 'title-1',
        color: resolveTextColor(colors, 'labels-primary'),
    })
    const button = (label: string, action: () => void, active = false) => (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: busy }}
            disabled={busy}
            onPress={action}
            style={[
                styles.chip,
                {
                    backgroundColor: active
                        ? colors.brandSecondary
                        : colors.fill.tertiary,
                },
            ]}
        >
            <Text
                style={[
                    styles.chipLabel,
                    {
                        color: active ? colors.brand : colors.labels.primary,
                    },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    )
    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={[
                    styles.root,
                    { backgroundColor: colors.background.primary },
                ]}
            >
                <ScreenGradientBackground />
                <AppHeader
                    isModal
                    CenterItem={
                        <TheText
                            size="body"
                            weight="600"
                            color="labels-primary"
                        >
                            {initial.id ? t('План') : t('Новый план')}
                        </TheText>
                    }
                    RightItem={
                        <TheButtonIcon
                            icon="xmark"
                            size="36"
                            view="grouped"
                            accessibilityLabel={t('Закрыть')}
                            onPress={onClose}
                            isDisabled={busy}
                        />
                    }
                />
                <ScrollView
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                    pointerEvents={busy ? 'none' : 'auto'}
                    contentContainerStyle={styles.scrollContent}
                >
                    <RequiredTitleInput
                        ref={inputRef}
                        editable={!busy}
                        accessibilityLabel={t('Название события')}
                        placeholder={t('Что запланируем?')}
                        placeholderTextColor={titlePlaceholderColor}
                        value={draft.title}
                        onChangeText={(title) => {
                            patch({ title })
                            if (
                                error === t('Добавьте название') &&
                                title.trim()
                            )
                                setError('')
                        }}
                        multiline
                        returnKeyType="done"
                        submitBehavior="blurAndSubmit"
                        style={[styles.title, titleStyle, titleAnimation]}
                    />
                    <View style={styles.palette}>
                        <AccentColorPicker
                            value={selectedAccent}
                            onChange={(accent) => {
                                if (accent)
                                    patch({
                                        color: resolveTextColor(colors, accent),
                                    })
                            }}
                        />
                    </View>
                    <Section paddingBottom={8}>
                        <Row
                            label={t('Весь день')}
                            description={t('Без привязки ко времени')}
                            RightElement={
                                <View
                                    style={{
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Toggle
                                        value={draft.allDay}
                                        onChange={(allDay) => patch({ allDay })}
                                        disabled={busy}
                                    />
                                </View>
                            }
                        />
                        <Separator offsetLeft={16} />
                        <Row
                            label={t('Дата')}
                            description={dateLabel(draft.date)}
                            RightElement={
                                <Icon
                                    name="chevron-right"
                                    size={19}
                                    color="labels-tertiary"
                                />
                            }
                            onPress={() => setDateModal('date')}
                        />
                        <Collapsible visible={!draft.allDay}>
                            <Separator offsetLeft={16} />
                            <Row
                                label={t('Время и длительность')}
                                description={`${timeLabel(draft.startMinute)} · ${Math.floor(draft.duration / 60) ? t('{0} ч', [Math.floor(draft.duration / 60)]) + ' ' : ''}${draft.duration % 60 ? t('{0} мин', [draft.duration % 60]) : ''}`}
                                RightElement={
                                    <Icon
                                        name="chevron-right"
                                        size={19}
                                        color="labels-tertiary"
                                    />
                                }
                                onPress={() => setTimeModal(true)}
                            />
                        </Collapsible>
                    </Section>
                    <Section paddingBottom={8}>
                        <RepeatFields
                            repeat={draft.repeat}
                            date={draft.date}
                            onChange={(repeat) =>
                                patch({
                                    repeat,
                                    ...(!repeat ? { until: null } : {}),
                                })
                            }
                        />
                        <Collapsible visible={!!draft.repeat}>
                            <Separator offsetLeft={16} />
                            <Row
                                label={t('Повторять до')}
                                description={
                                    draft.until
                                        ? dateLabel(draft.until)
                                        : t('Без даты окончания')
                                }
                                RightElement={
                                    <Icon
                                        name="chevron-right"
                                        size={19}
                                        color="labels-tertiary"
                                    />
                                }
                                onPress={() => setDateModal('until')}
                            />
                            <View style={styles.clearUntil}>
                                {button(t('Убрать дату окончания'), () =>
                                    patch({ until: null }),
                                )}
                            </View>
                        </Collapsible>
                    </Section>
                    <Section paddingBottom={8}>
                        <RichTextEditorContent controller={richTextEditor} />
                    </Section>
                    <Section paddingBottom={8}>
                        <Row
                            label={t('Задача или привычка')}
                            description={
                                draft.link
                                    ? t('Связанная задача или привычка')
                                    : t('Привяжите задачу или привычку')
                            }
                        />
                        {draft.link ? (
                            <>
                                <Separator offsetLeft={16} />
                                <Row
                                    label={
                                        linkedEntity?.title ??
                                        t('Связанная сущность удалена')
                                    }
                                    description={`${draft.link.type === 'task' ? t('Задача') : t('Привычка')} · ${linkedEntity ? repeatLabel(linkedEntity.repeat) : t('недоступна')}`}
                                    disabled={!linkedEntity}
                                    labelColor={
                                        linkedEntity
                                            ? 'labels-primary'
                                            : 'labels-tertiary'
                                    }
                                    icon={
                                        <View
                                            style={[
                                                styles.entityIcon,
                                                {
                                                    backgroundColor:
                                                        colors.brandSecondary,
                                                },
                                            ]}
                                        >
                                            <Icon
                                                name={
                                                    draft.link.type === 'task'
                                                        ? 'check-outline'
                                                        : 'fire'
                                                }
                                                size={17}
                                                color="brand"
                                            />
                                        </View>
                                    }
                                    RightElement={
                                        linkedEntity ? (
                                            <Icon
                                                name="chevron-right"
                                                size={19}
                                                color="labels-tertiary"
                                            />
                                        ) : undefined
                                    }
                                    onPress={
                                        linkedEntity
                                            ? () =>
                                                  draft.link &&
                                                  onOpenLink(draft.link, draft)
                                            : undefined
                                    }
                                />
                                <View style={styles.unlink}>
                                    {button(t('Отвязать'), () =>
                                        patch({ link: null }),
                                    )}
                                </View>
                            </>
                        ) : (
                            <View style={styles.linkButtons}>
                                {button(t('Связать задачу'), () => {
                                    setLinkType('task')
                                    setLinkDraft(null)
                                    setQuery('')
                                })}
                                {button(t('Связать привычку'), () => {
                                    setLinkType('habit')
                                    setLinkDraft(null)
                                    setQuery('')
                                })}
                            </View>
                        )}
                    </Section>
                    {error ? (
                        <Text
                            accessibilityRole="alert"
                            style={[
                                styles.errorText,
                                { color: colors.accent.red },
                            ]}
                        >
                            {error}
                        </Text>
                    ) : null}
                    {initial.id && (
                        <Section paddingBottom={8}>
                            {initial.repeat && (
                                <>
                                    <Row
                                        label={t('Удалить только этот день')}
                                        description={t(
                                            'Убрать план из выбранной даты',
                                        )}
                                        labelColor="accent-red"
                                        RightElement={
                                            <Icon
                                                name="chevron-right"
                                                size={18}
                                                color="labels-tertiary"
                                            />
                                        }
                                        onPress={() => setPendingDelete(true)}
                                        disabled={busy}
                                    />
                                    <Separator offsetLeft={16} />
                                </>
                            )}
                            <Row
                                label={
                                    initial.repeat
                                        ? t('Удалить всю серию')
                                        : t('Удалить план')
                                }
                                description={t('Удалить план из календаря')}
                                labelColor="accent-red"
                                icon={
                                    <Icon
                                        name="trash"
                                        size={20}
                                        color="accent-red"
                                    />
                                }
                                RightElement={
                                    <Icon
                                        name="chevron-right"
                                        size={18}
                                        color="labels-tertiary"
                                    />
                                }
                                onPress={() => setPendingDelete(false)}
                                disabled={busy}
                            />
                        </Section>
                    )}
                </ScrollView>
                <View style={styles.saveButton}>
                    <TheButton
                        size="52"
                        variant="primary"
                        view="brand"
                        isWide
                        onPress={save}
                        isDisabled={busy}
                    >
                        {busy ? (
                            <ActivityIndicator color={colors.gray.white} />
                        ) : (
                            t('Сохранить')
                        )}
                    </TheButton>
                </View>
            </KeyboardAvoidingView>
            {dateModal !== null && (
                <CalendarDateModal
                    visible={parentVisible}
                    value={
                        dateModal === 'until'
                            ? (draft.until ?? draft.date)
                            : draft.date
                    }
                    title={
                        dateModal === 'until'
                            ? t('Повторять до')
                            : t('Выберите дату')
                    }
                    onClose={() => setDateModal(null)}
                    onSave={(date) =>
                        dateModal === 'until'
                            ? patch({ until: date })
                            : patch({ date })
                    }
                />
            )}
            {timeModal && (
                <CalendarTimeModal
                    visible={parentVisible}
                    startMinute={draft.startMinute}
                    duration={draft.duration}
                    onClose={() => setTimeModal(false)}
                    onSave={(startMinute, duration) =>
                        patch({ startMinute, duration })
                    }
                />
            )}
            <LinkPickerModal
                visible={parentVisible && linkType !== null}
                type={linkType}
                items={linkedList}
                date={draft.date}
                selected={linkDraft}
                query={query}
                onQuery={setQuery}
                onSelect={(link) => setLinkDraft(link)}
                onClose={() => setLinkType(null)}
                onReset={() => setLinkDraft(null)}
                onSave={saveLinkSelection}
            />
            <DeleteConfirmationSheet
                visible={pendingDelete !== null}
                onCancel={() => setPendingDelete(null)}
                onConfirm={() => {
                    const onlyOccurrence = pendingDelete
                    setPendingDelete(null)
                    if (onlyOccurrence !== null)
                        void run(() => onDelete(onlyOccurrence))
                }}
            />
        </>
    )
}

function LinkPickerModal({
    visible,
    type,
    items,
    date,
    selected,
    query,
    onQuery,
    onSelect,
    onClose,
    onReset,
    onSave,
}: {
    visible: boolean
    type: 'task' | 'habit' | null
    items: (Task | Habit)[]
    date: string
    selected: CalendarEvent['link']
    query: string
    onQuery: (v: string) => void
    onSelect: (v: CalendarEvent['link']) => void
    onClose: () => void
    onReset: () => void
    onSave: () => void
}) {
    useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View
                    style={[
                        styles.pickerSheet,
                        { backgroundColor: colors.background.primary },
                    ]}
                >
                    <View style={styles.pickerHeader}>
                        <Text
                            style={[
                                styles.pickerTitle,
                                { color: colors.labels.primary },
                            ]}
                        >
                            {type === 'task'
                                ? t('Связать задачу')
                                : t('Связать привычку')}
                        </Text>
                        <Pressable onPress={onClose}>
                            <Icon
                                name="xmark"
                                size={21}
                                color="labels-secondary"
                            />
                        </Pressable>
                    </View>
                    <Text
                        style={[
                            styles.pickerSubtitle,
                            { color: colors.labels.secondary },
                        ]}
                    >
                        {t('Подходящие на {0}', [dateLabel(date)])}
                    </Text>
                    <TextInput
                        value={query}
                        onChangeText={onQuery}
                        placeholder={t('Поиск')}
                        placeholderTextColor={colors.labels.tertiary}
                        returnKeyType="done"
                        style={[
                            styles.search,
                            {
                                color: colors.labels.primary,
                                backgroundColor: colors.background.secondary,
                            },
                        ]}
                    />
                    <ScrollView
                        style={styles.pickerList}
                        keyboardShouldPersistTaps="handled"
                    >
                        {items.map((item) => {
                            const active =
                                selected?.type === type &&
                                selected.id === item.id
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() =>
                                        onSelect(
                                            type ? { type, id: item.id } : null,
                                        )
                                    }
                                    style={styles.pickRow}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            {
                                                borderColor: active
                                                    ? colors.brand
                                                    : colors.labels.tertiary,
                                            },
                                        ]}
                                    >
                                        {active && (
                                            <View
                                                style={[
                                                    styles.radioDot,
                                                    {
                                                        backgroundColor:
                                                            colors.brand,
                                                    },
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.pickRowTexts}>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.pickItemTitle,
                                                {
                                                    color: colors.labels
                                                        .primary,
                                                },
                                            ]}
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.pickItemSubtitle,
                                                {
                                                    color: colors.labels
                                                        .secondary,
                                                },
                                            ]}
                                        >
                                            {item.description ||
                                                repeatLabel(item.repeat)}
                                        </Text>
                                    </View>
                                </Pressable>
                            )
                        })}
                        {!items.length && (
                            <Text
                                style={[
                                    styles.pickEmpty,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {t('На этот день элементов не найдено')}
                            </Text>
                        )}
                    </ScrollView>
                    <View style={styles.pickerActions}>
                        <Pressable onPress={onReset}>
                            <Text
                                style={[
                                    styles.pickerReset,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {t('Сбросить')}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onSave}
                            style={[
                                styles.done,
                                { backgroundColor: colors.brand },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.pickerDoneLabel,
                                    { color: colors.gray.white },
                                ]}
                            >
                                {t('Сохранить')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
