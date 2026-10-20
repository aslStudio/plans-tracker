import { builtinLabel } from '@/shared/lib/i18n/builtin-label'
import { t, useLanguage } from '@/shared/lib/i18n'
import { TaskStatusSettings } from '@/features/manage-task-statuses/TaskStatusSettings'
import {
    SettingsHighlight,
    SettingsHighlightContext,
} from './ui/SettingsHighlight'
import { lottie } from '@/shared/config/lottie'
import Animated from 'react-native-reanimated'
import { listLayout, listEnter, listExit } from '@/shared/lib/motion'
import { Collapsible } from '@/shared/ui/Collapsible'
import { useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'

import type { HabitCategory, TaskGroup, TaskPriority } from '@/shared/api'
import type { ThemeMode } from '@/shared/lib/theme'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { AppHeader } from '@/shared/ui/AppHeader'
import { EntityEditorSheet } from '@/shared/ui/EntityEditorSheet'
import type { EntityEditorValue } from '@/shared/ui/EntityEditorSheet'
import { Icon } from '@/shared/ui/Icon'
import type { NativeMenuItem } from '@/shared/ui/NativeMenu'
import { PropertyRow } from '@/shared/ui/PropertyRow'
import { Row } from '@/shared/ui/Row'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { Toggle } from '@/shared/ui/Toggle'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { ExplanationBottomSheet } from '@/shared/ui/ExplanationBottomSheet'

import type { SettingsScreenProps } from './model'
import { useStyles } from './styles'
import { AppAccentPicker } from './ui/AppAccentPicker'

/** Either `{ id: null }` (creating) or `{ id: string }` (editing that entity), `null` when no sheet should be open. */
type EditingTarget = { id: string | null } | null

const THEME_MODE_LABELS: Record<ThemeMode, string> = {
    get light() {
        return t('Светлая')
    },
    get dark() {
        return t('Тёмная')
    },
    get system() {
        return t('Системная')
    },
}

export function SettingsScreen({
    highlight,
    context,
    language,
    onChangeLanguage,
    themeMode,
    onChangeThemeMode,
    taskDaysAhead = 1,
    onChangeTaskDaysAhead,
    onOpenMemory,
    onOpenNotifications,
    onDownloadLogs,
    onClearLogs,
    onResetApp,
    useGroups,
    usePriority,
    groups,
    priorities,
    useHabitCategories,
    habitCategories,
    accentName,
    onClose,
    onToggleGroups,
    onTogglePriority,
    onCreateGroup,
    onUpdateGroup,
    onDeleteGroup,
    onCreatePriority,
    onUpdatePriority,
    onDeletePriority,
    onToggleHabitCategories,
    onCreateHabitCategory,
    onUpdateHabitCategory,
    onDeleteHabitCategory,
    onChangeAccent,
}: SettingsScreenProps) {
    const appLanguage = useLanguage()

    const scrollRef = useRef<ScrollView>(null)
    const contentRef = useRef<View>(null)
    const styles = useStyles()
    const [editingGroup, setEditingGroup] = useState<EditingTarget>(null)
    const [editingPriority, setEditingPriority] = useState<EditingTarget>(null)
    const [editingHabitCategory, setEditingHabitCategory] =
        useState<EditingTarget>(null)
    const [confirmClearLogs, setConfirmClearLogs] = useState(false)
    const [activeInfo, setActiveInfo] = useState<'days' | null>(null)

    // No context (e.g. an onboarding deep link into a specific row) shows every section.
    const showTaskSettings = context === undefined || context === 'tasks'
    const showHabitSettings = context === undefined || context === 'habits'

    const languageItems: NativeMenuItem[] = (
        [
            ['ru', 'Русский'],
            ['en', 'English'],
        ] as const
    ).map(([code, label]) => ({
        key: code,
        label,
        systemImage: 'checkmark',
        icon: 'check-outline',
        isActive: code === (language ?? appLanguage),
        onPress: () => onChangeLanguage?.(code),
    }))
    const themeModeItems: NativeMenuItem[] = (
        ['light', 'dark', 'system'] as const
    ).map((mode) => ({
        key: mode,
        label: THEME_MODE_LABELS[mode],
        systemImage: 'checkmark',
        icon: 'check-outline',
        isActive: mode === themeMode,
        onPress: () => onChangeThemeMode(mode),
    }))

    const editingGroupEntity = editingGroup?.id
        ? groups.find((g) => g.id === editingGroup.id)
        : undefined
    const editingPriorityEntity = editingPriority?.id
        ? priorities.find((p) => p.id === editingPriority.id)
        : undefined
    const editingHabitCategoryEntity = editingHabitCategory?.id
        ? habitCategories.find((c) => c.id === editingHabitCategory.id)
        : undefined

    function submitGroup(value: EntityEditorValue) {
        if (!value.color) return // a group always has a color — the picker just never offers "none" for it
        if (editingGroup?.id)
            onUpdateGroup(editingGroup.id, {
                label: value.label,
                color: value.color,
            })
        else onCreateGroup({ label: value.label, color: value.color })
        setEditingGroup(null)
    }

    function submitPriority(value: EntityEditorValue) {
        if (editingPriority?.id) onUpdatePriority(editingPriority.id, value)
        else onCreatePriority(value)
        setEditingPriority(null)
    }

    function submitHabitCategory(value: EntityEditorValue) {
        if (editingHabitCategory?.id)
            onUpdateHabitCategory(editingHabitCategory.id, value)
        else onCreateHabitCategory(value)
        setEditingHabitCategory(null)
    }

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={
                    <TheText size="body" weight="600">
                        {t('Настройки')}
                    </TheText>
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
            <SettingsHighlightContext.Provider
                value={{
                    target: highlight,
                    scroll: scrollRef,
                    content: contentRef,
                    top: styles.content.paddingTop,
                }}
            >
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        ref={contentRef}
                        collapsable={false}
                        style={styles.content}
                    >
                        <Section
                            TopElement={
                                <SectionTitle>
                                    {t('Общие настройки')}
                                </SectionTitle>
                            }
                        >
                            <View style={styles.accentPickerCard}>
                                <AppAccentPicker
                                    value={accentName}
                                    onChange={onChangeAccent}
                                />
                            </View>
                            <Separator offsetLeft={16} />
                            <PropertyRow
                                label={t('Язык')}
                                valueLabel={
                                    (language ?? appLanguage) === 'ru'
                                        ? 'Русский'
                                        : 'English'
                                }
                                items={languageItems}
                            />
                            <Separator offsetLeft={16} />
                            <PropertyRow
                                label={t('Оформление')}
                                valueLabel={THEME_MODE_LABELS[themeMode]}
                                items={themeModeItems}
                            />
                            <Separator offsetLeft={16} />
                            <Row
                                label={t('Память')}
                                description={t(
                                    'Устройство, iCloud и очистка данных',
                                )}
                                onPress={onOpenMemory}
                                RightElement={
                                    <Icon
                                        name="chevron-right"
                                        size={20}
                                        color="labels-tertiary"
                                    />
                                }
                            />
                            {onOpenNotifications && (
                                <>
                                    <Separator offsetLeft={16} />
                                    <SettingsHighlight id="notifications">
                                        <Row
                                            label={t('Уведомления')}
                                            description={t(
                                                'Задачи, привычки, календарь и серия',
                                            )}
                                            onPress={onOpenNotifications}
                                            RightElement={
                                                <Icon
                                                    name="chevron-right"
                                                    size={20}
                                                    color="labels-tertiary"
                                                />
                                            }
                                        />
                                    </SettingsHighlight>
                                </>
                            )}
                        </Section>

                        {showTaskSettings && <TaskStatusSettings />}

                        {showTaskSettings && (
                            <Section>
                                <SettingsHighlight id="groups">
                                    <Row
                                        label={t('Группы')}
                                        RightElement={
                                            <Toggle
                                                value={useGroups}
                                                onChange={onToggleGroups}
                                            />
                                        }
                                    />
                                </SettingsHighlight>
                                <Collapsible visible={useGroups}>
                                    <Separator offsetLeft={16} />
                                    {groups.map((group, index) => (
                                        <EntityRow
                                            key={group.id}
                                            label={group.label}
                                            color={group.color}
                                            showSeparator={index > 0}
                                            onPress={() =>
                                                setEditingGroup({
                                                    id: group.id,
                                                })
                                            }
                                        />
                                    ))}
                                    <Separator offsetLeft={16} />
                                    <Row
                                        label={t('Добавить группу')}
                                        labelColor="brand"
                                        onPress={() =>
                                            setEditingGroup({ id: null })
                                        }
                                    />
                                </Collapsible>
                                <Separator offsetLeft={16} />
                                <SettingsHighlight id="priority">
                                    <Row
                                        label={t('Приоритет')}
                                        RightElement={
                                            <Toggle
                                                value={usePriority}
                                                onChange={onTogglePriority}
                                            />
                                        }
                                    />
                                </SettingsHighlight>
                                <Collapsible visible={usePriority}>
                                    <Separator offsetLeft={16} />
                                    {priorities.map((priority, index) => (
                                        <EntityRow
                                            key={priority.id}
                                            label={builtinLabel(priority)}
                                            color={priority.color ?? null}
                                            showSeparator={index > 0}
                                            onPress={() =>
                                                setEditingPriority({
                                                    id: priority.id,
                                                })
                                            }
                                        />
                                    ))}
                                    <Separator offsetLeft={16} />
                                    <Row
                                        label={t('Добавить приоритет')}
                                        labelColor="brand"
                                        onPress={() =>
                                            setEditingPriority({ id: null })
                                        }
                                    />
                                </Collapsible>
                                {onChangeTaskDaysAhead && (
                                    <>
                                        <Separator offsetLeft={16} />
                                        <SettingsHighlight id="days">
                                            <Row
                                                label={t(
                                                    'Показывать дней вперёд',
                                                )}
                                                description={t(
                                                    'Сколько будущих дней показывать в списке',
                                                )}
                                                onLabelPress={() =>
                                                    setActiveInfo('days')
                                                }
                                                RightElement={
                                                    <View
                                                        style={
                                                            styles.stepperRow
                                                        }
                                                    >
                                                        <TheButtonIcon
                                                            icon="minus"
                                                            size="36"
                                                            variant="plain"
                                                            accessibilityLabel={t(
                                                                'На один день меньше',
                                                            )}
                                                            disabledAppearance="opacity"
                                                            isDisabled={
                                                                taskDaysAhead <=
                                                                1
                                                            }
                                                            onPress={() =>
                                                                onChangeTaskDaysAhead(
                                                                    Math.max(
                                                                        1,
                                                                        taskDaysAhead -
                                                                            1,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <TheText
                                                            size="body"
                                                            weight="600"
                                                            style={
                                                                styles.stepperValue
                                                            }
                                                        >
                                                            {taskDaysAhead}
                                                        </TheText>
                                                        <TheButtonIcon
                                                            icon="plus"
                                                            size="36"
                                                            variant="plain"
                                                            accessibilityLabel={t(
                                                                'На один день больше',
                                                            )}
                                                            disabledAppearance="opacity"
                                                            isDisabled={
                                                                taskDaysAhead >=
                                                                14
                                                            }
                                                            onPress={() =>
                                                                onChangeTaskDaysAhead(
                                                                    Math.min(
                                                                        14,
                                                                        taskDaysAhead +
                                                                            1,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                }
                                            />
                                        </SettingsHighlight>
                                    </>
                                )}
                            </Section>
                        )}

                        {showHabitSettings && (
                            <Section>
                                <SettingsHighlight id="categories">
                                    <Row
                                        label={t('Категории')}
                                        RightElement={
                                            <Toggle
                                                value={useHabitCategories}
                                                onChange={
                                                    onToggleHabitCategories
                                                }
                                            />
                                        }
                                    />
                                </SettingsHighlight>
                                <Collapsible visible={useHabitCategories}>
                                    <Separator offsetLeft={16} />
                                    {habitCategories.map((category, index) => (
                                        <EntityRow
                                            key={category.id}
                                            label={category.label}
                                            color={category.color ?? null}
                                            showSeparator={index > 0}
                                            onPress={() =>
                                                setEditingHabitCategory({
                                                    id: category.id,
                                                })
                                            }
                                        />
                                    ))}
                                    <Separator offsetLeft={16} />
                                    <Row
                                        label={t('Добавить категорию')}
                                        labelColor="brand"
                                        onPress={() =>
                                            setEditingHabitCategory({
                                                id: null,
                                            })
                                        }
                                    />
                                </Collapsible>
                            </Section>
                        )}
                        {(onDownloadLogs || onClearLogs || onResetApp) && (
                            <Section
                                TopElement={
                                    <SectionTitle>
                                        {t('Диагностика')}
                                    </SectionTitle>
                                }
                            >
                                {onDownloadLogs && (
                                    <Row
                                        label={t('Скачать логи')}
                                        description={t(
                                            'Сохранить журнал приложения в TXT-файл',
                                        )}
                                        labelColor="brand"
                                        onPress={onDownloadLogs}
                                        RightElement={
                                            <Icon
                                                name="chevron-right"
                                                size={18}
                                                color="labels-tertiary"
                                            />
                                        }
                                    />
                                )}
                                {onDownloadLogs && onClearLogs && (
                                    <Separator offsetLeft={16} />
                                )}
                                {onClearLogs && (
                                    <Row
                                        label={t('Очистить логи')}
                                        description={t(
                                            'Удалить записи текущего дня',
                                        )}
                                        labelColor="accent-red"
                                        onPress={() =>
                                            setConfirmClearLogs(true)
                                        }
                                        RightElement={
                                            <Icon
                                                name="chevron-right"
                                                size={18}
                                                color="labels-tertiary"
                                            />
                                        }
                                    />
                                )}
                                {(onDownloadLogs || onClearLogs) &&
                                    onResetApp && <Separator offsetLeft={16} />}
                                {onResetApp && (
                                    <Row
                                        label={t('Сбросить приложение')}
                                        description={t(
                                            'Удалить все локальные данные и открыть онбординг заново',
                                        )}
                                        labelColor="accent-red"
                                        onPress={onResetApp}
                                        RightElement={
                                            <Icon
                                                name="chevron-right"
                                                size={18}
                                                color="labels-tertiary"
                                            />
                                        }
                                    />
                                )}
                            </Section>
                        )}
                    </View>
                </ScrollView>
            </SettingsHighlightContext.Provider>

            {editingGroup && (
                <EntityEditorSheet
                    title={editingGroup.id ? t('Группа') : t('Новая группа')}
                    allowNoColor={false}
                    initialValue={{
                        label: editingGroupEntity?.label ?? '',
                        color: editingGroupEntity?.color ?? 'accent-turquoise',
                    }}
                    onClose={() => setEditingGroup(null)}
                    onSubmit={submitGroup}
                    onDelete={
                        editingGroup.id
                            ? () => {
                                  onDeleteGroup(editingGroup.id!)
                                  setEditingGroup(null)
                              }
                            : undefined
                    }
                />
            )}

            {editingPriority && (
                <EntityEditorSheet
                    title={
                        editingPriority.id
                            ? t('Приоритет')
                            : t('Новый приоритет')
                    }
                    allowNoColor
                    initialValue={{
                        label: editingPriorityEntity?.label ?? '',
                        color:
                            (editingPriorityEntity?.color as EntityEditorValue['color']) ??
                            null,
                    }}
                    onClose={() => setEditingPriority(null)}
                    onSubmit={submitPriority}
                    onDelete={
                        editingPriority.id
                            ? () => {
                                  onDeletePriority(editingPriority.id!)
                                  setEditingPriority(null)
                              }
                            : undefined
                    }
                />
            )}

            {editingHabitCategory && (
                <EntityEditorSheet
                    title={
                        editingHabitCategory.id
                            ? t('Категория')
                            : t('Новая категория')
                    }
                    allowNoColor
                    initialValue={{
                        label: editingHabitCategoryEntity?.label ?? '',
                        color:
                            (editingHabitCategoryEntity?.color as EntityEditorValue['color']) ??
                            null,
                    }}
                    onClose={() => setEditingHabitCategory(null)}
                    onSubmit={submitHabitCategory}
                    onDelete={
                        editingHabitCategory.id
                            ? () => {
                                  onDeleteHabitCategory(
                                      editingHabitCategory.id!,
                                  )
                                  setEditingHabitCategory(null)
                              }
                            : undefined
                    }
                />
            )}
            <DeleteConfirmationSheet
                visible={confirmClearLogs}
                onCancel={() => setConfirmClearLogs(false)}
                onConfirm={() => {
                    setConfirmClearLogs(false)
                    onClearLogs?.()
                }}
            />
            <ExplanationBottomSheet
                visible={activeInfo !== null}
                title={t('Планируйте заранее')}
                description={t(
                    'Выберите, сколько ближайших дней показывать в списке задач. Так можно планировать наперёд и сохранять удобный обзор.',
                )}
                animation={lottie.calendar}
                onClose={() => setActiveInfo(null)}
            />
        </View>
    )
}

function SectionTitle({ children }: { children: string }) {
    const styles = useStyles()

    return (
        <View style={styles.sectionTitle}>
            <TheText size="body" weight="600" color="labels-secondary">
                {children}
            </TheText>
        </View>
    )
}

function EntityRow({
    label,
    color,
    showSeparator,
    onPress,
}: {
    label: string
    color:
        | TaskGroup['color']
        | TaskPriority['color']
        | HabitCategory['color']
        | null
    showSeparator: boolean
    onPress: () => void
}) {
    return (
        <Animated.View
            layout={listLayout}
            entering={listEnter}
            exiting={listExit}
        >
            {showSeparator && <Separator offsetLeft={16} />}
            <Row
                label={label}
                icon={color ? <ColorDot color={color} /> : undefined}
                onPress={onPress}
            />
        </Animated.View>
    )
}

function ColorDot({
    color,
}: {
    color: NonNullable<
        TaskGroup['color'] | TaskPriority['color'] | HabitCategory['color']
    >
}) {
    const styles = useStyles()
    const backgroundColor = useThemeColor(color)
    return <View style={[styles.colorDot, { backgroundColor }]} />
}
