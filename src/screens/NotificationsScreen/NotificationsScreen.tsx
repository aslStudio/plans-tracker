import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

import { AppHeader } from '@/shared/ui/AppHeader'
import { ExplanationBottomSheet } from '@/shared/ui/ExplanationBottomSheet'
import { Row } from '@/shared/ui/Row'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { Toggle } from '@/shared/ui/Toggle'

import type { NotificationsScreenProps } from './model'
import { useStyles } from './styles'

type InfoKey =
    | 'tasksEmptyDay'
    | 'tasksOverdue'
    | 'tasksEndOfDay'
    | 'habitsHalfDay'
    | 'habitsEndOfDay'
    | 'calendarUpcoming'
    | 'calendarStart'
    | 'streakAtRisk'
    | 'streakBroken'

const INFO: Record<InfoKey, { title: string; description: string }> = {
    tasksEmptyDay: {
        get title() {
            return t('Пустой список на день')
        },
        get description() {
            return t(
                'Если к 10:00 на сегодня ещё не добавлено ни одной задачи, пришлём короткое напоминание — так проще не забыть спланировать день с утра.',
            )
        },
    },
    tasksOverdue: {
        get title() {
            return t('Просроченные задачи')
        },
        get description() {
            return t(
                'Если с прошлых дней остались незакрытые задачи, напомним об этом в 10:00 — или в 11:00, если на сегодня дел пока нет, чтобы уведомления не пришли подряд.',
            )
        },
    },
    tasksEndOfDay: {
        get title() {
            return t('Конец дня')
        },
        get description() {
            return t(
                'В 18:00 проверим, остались ли на сегодня незакрытые задачи, и пришлём напоминание, пока ещё есть время их закрыть.',
            )
        },
    },
    habitsHalfDay: {
        get title() {
            return t('Половина дня позади')
        },
        get description() {
            return t(
                'Если к полудню ни одна привычка на сегодня ещё не отмечена выполненной, пришлём напоминание — самое время начать.',
            )
        },
    },
    habitsEndOfDay: {
        get title() {
            return t('Конец дня')
        },
        get description() {
            return t(
                'В 20:00 проверим, все ли привычки на сегодня выполнены, и напомним, если что-то осталось.',
            )
        },
    },
    calendarUpcoming: {
        get title() {
            return t('Скоро начало')
        },
        get description() {
            return t(
                'За 15 минут до начала запланированного мероприятия пришлём короткое напоминание, чтобы вы успели подготовиться.',
            )
        },
    },
    calendarStart: {
        get title() {
            return t('Начало мероприятия')
        },
        get description() {
            return t(
                'В момент начала мероприятия пришлём уведомление — удобно, если вы не следите за часами.',
            )
        },
    },
    streakAtRisk: {
        get title() {
            return t('Серия под угрозой')
        },
        get description() {
            return t(
                'В 20:00, за 4 часа до конца суток, если сегодняшняя серия ещё не закрыта, напомним, что времени остаётся немного.',
            )
        },
    },
    streakBroken: {
        get title() {
            return t('Серия сорвалась')
        },
        get description() {
            return t(
                'Если день закончился без выполнения всех привычек, в полночь пришлём уведомление о том, что серия прервалась.',
            )
        },
    },
}

export function NotificationsScreen({
    settings,
    permissionDenied,
    onClose,
    onToggleEnabled,
    onChangeSettings,
    onOpenSystemSettings,
}: NotificationsScreenProps) {
    useLanguage()

    const styles = useStyles()
    const groupsDisabled = !settings.enabled
    const [activeInfo, setActiveInfo] = useState<InfoKey | null>(null)

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={
                    <TheText size="body" weight="600">
                        {t('Уведомления')}
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
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Section>
                    <Row
                        label={t('Включить уведомления')}
                        description={
                            permissionDenied
                                ? t(
                                      'Разрешение отклонено в системных настройках',
                                  )
                                : t(
                                      'Напоминания о задачах, привычках, календаре и серии',
                                  )
                        }
                        onPress={
                            permissionDenied ? onOpenSystemSettings : undefined
                        }
                        RightElement={
                            permissionDenied ? undefined : (
                                <Toggle
                                    testID="notifications-enabled"
                                    value={settings.enabled}
                                    onChange={onToggleEnabled}
                                />
                            )
                        }
                    />
                </Section>

                <Section
                    TopElement={<SectionTitle>{t('Задачи')}</SectionTitle>}
                >
                    <Row
                        label={t('Список на день пуст')}
                        description={t(
                            'В 10:00, если на сегодня ещё нет ни одной задачи',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('tasksEmptyDay')}
                        RightElement={
                            <Toggle
                                testID="notifications-tasks-empty-day"
                                value={settings.tasksEmptyDay}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ tasksEmptyDay: value })
                                }
                            />
                        }
                    />
                    <Separator offsetLeft={16} />
                    <Row
                        label={t('Просроченные задачи')}
                        description={t(
                            'В 10:00 или в 11:00, если остались дела с прошлых дней',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('tasksOverdue')}
                        RightElement={
                            <Toggle
                                testID="notifications-tasks-overdue"
                                value={settings.tasksOverdue}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ tasksOverdue: value })
                                }
                            />
                        }
                    />
                    <Separator offsetLeft={16} />
                    <Row
                        label={t('Конец дня')}
                        description={t(
                            'В 18:00, если на сегодня остались незакрытые задачи',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('tasksEndOfDay')}
                        RightElement={
                            <Toggle
                                testID="notifications-tasks-end-of-day"
                                value={settings.tasksEndOfDay}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ tasksEndOfDay: value })
                                }
                            />
                        }
                    />
                </Section>

                <Section
                    TopElement={<SectionTitle>{t('Привычки')}</SectionTitle>}
                >
                    <Row
                        label={t('Половина дня прошла')}
                        description={t(
                            'В 12:00, если ни одна привычка ещё не выполнена',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('habitsHalfDay')}
                        RightElement={
                            <Toggle
                                testID="notifications-habits-half-day"
                                value={settings.habitsHalfDay}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ habitsHalfDay: value })
                                }
                            />
                        }
                    />
                    <Separator offsetLeft={16} />
                    <Row
                        label={t('Конец дня')}
                        description={t(
                            'В 20:00, если не все привычки на сегодня выполнены',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('habitsEndOfDay')}
                        RightElement={
                            <Toggle
                                testID="notifications-habits-end-of-day"
                                value={settings.habitsEndOfDay}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ habitsEndOfDay: value })
                                }
                            />
                        }
                    />
                </Section>

                <Section
                    TopElement={<SectionTitle>{t('Календарь')}</SectionTitle>}
                >
                    <Row
                        label={t('Скоро начало')}
                        description={t(
                            'За 15 минут до начала запланированного мероприятия',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('calendarUpcoming')}
                        RightElement={
                            <Toggle
                                testID="notifications-calendar-upcoming"
                                value={settings.calendarUpcoming}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({
                                        calendarUpcoming: value,
                                    })
                                }
                            />
                        }
                    />
                    <Separator offsetLeft={16} />
                    <Row
                        label={t('Начало мероприятия')}
                        description={t(
                            'В момент начала запланированного мероприятия',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('calendarStart')}
                        RightElement={
                            <Toggle
                                testID="notifications-calendar-start"
                                value={settings.calendarStart}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ calendarStart: value })
                                }
                            />
                        }
                    />
                </Section>

                <Section TopElement={<SectionTitle>{t('Серия')}</SectionTitle>}>
                    <Row
                        label={t('Серия под угрозой')}
                        description={t(
                            'В 20:00, если сегодняшняя серия ещё не выполнена',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('streakAtRisk')}
                        RightElement={
                            <Toggle
                                testID="notifications-streak-at-risk"
                                value={settings.streakAtRisk}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ streakAtRisk: value })
                                }
                            />
                        }
                    />
                    <Separator offsetLeft={16} />
                    <Row
                        label={t('Серия сорвалась')}
                        description={t(
                            'В полночь, если день закончился без всех привычек',
                        )}
                        disabled={groupsDisabled}
                        onLabelPress={() => setActiveInfo('streakBroken')}
                        RightElement={
                            <Toggle
                                testID="notifications-streak-broken"
                                value={settings.streakBroken}
                                disabled={groupsDisabled}
                                onChange={(value) =>
                                    onChangeSettings({ streakBroken: value })
                                }
                            />
                        }
                    />
                </Section>
            </ScrollView>

            <ExplanationBottomSheet
                visible={activeInfo !== null}
                title={activeInfo ? INFO[activeInfo].title : ''}
                description={activeInfo ? INFO[activeInfo].description : ''}
                animation={lottie.notification}
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
