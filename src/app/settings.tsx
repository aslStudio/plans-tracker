import { t, useLanguage, setLanguage } from '@/shared/lib/i18n'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { calendarSettings } from '@/shared/api/calendar/repository'
import type { CalendarSettings } from '@/shared/api/calendar/model'

import {
    defaultAppSettings,
    habitsRepository,
    settingsRepository,
    tasksRepository,
} from '@/shared/api'
import type {
    AppSettings,
    HabitCategory,
    TaskGroup,
    TaskPriority,
} from '@/shared/api'
import { useAccent } from '@/shared/lib/theme/accent-provider'
import { useThemeMode } from '@/shared/lib/theme'
import {
    clearAppLogs,
    formatAppLogs,
    listAppLogs,
    logError,
    logInfo,
} from '@/shared/lib/diagnostics/app-logger'
import { resetAppToFirstLaunch } from '@/shared/lib/dev/reset-app-state'
import { isTestFlightBuild } from '../../modules/app-environment'

import { SettingsScreen } from '@/screens/SettingsScreen'
import type { SettingsScreenContext } from '@/screens/SettingsScreen/model'

const SETTINGS_CONTEXTS: SettingsScreenContext[] = [
    'tasks',
    'habits',
    'calendar',
]

export default function SettingsRoute() {
    const language = useLanguage()

    const router = useRouter()
    const { highlight, from } = useLocalSearchParams<{
        highlight?: string
        from?: string
    }>()
    const context = SETTINGS_CONTEXTS.find((value) => value === from)
    const { selectedAccent, setAccentColor } = useAccent()
    const { themeMode, setThemeMode } = useThemeMode()
    const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)
    const [calendarOptions, setCalendarOptions] = useState<CalendarSettings>({
        showTasks: true,
        showHabits: true,
    })
    const [groups, setGroups] = useState<TaskGroup[]>([])
    const [priorities, setPriorities] = useState<TaskPriority[]>([])
    const [habitCategories, setHabitCategories] = useState<HabitCategory[]>([])

    async function load() {
        const [
            nextSettings,
            nextGroups,
            nextPriorities,
            nextHabitCategories,
            nextCalendarOptions,
        ] = await Promise.all([
            settingsRepository.get(),
            tasksRepository.listGroups(),
            tasksRepository.listPriorities(),
            habitsRepository.listCategories(),
            calendarSettings.get(),
        ])
        setCalendarOptions(nextCalendarOptions)
        setSettings(nextSettings)
        setGroups(nextGroups)
        setPriorities(nextPriorities)
        setHabitCategories(nextHabitCategories)
    }

    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            void load()
        }, [language]),
    )

    return (
        <SettingsScreen
            highlight={highlight}
            context={context}
            language={language}
            onChangeLanguage={(value) => {
                void setLanguage(value).catch(() =>
                    Alert.alert(
                        t('Не удалось сохранить язык'),
                        t('Попробуйте ещё раз.'),
                    ),
                )
            }}
            themeMode={themeMode}
            onChangeThemeMode={setThemeMode}
            onOpenMemory={() => router.push('/memory')}
            onOpenNotifications={() => router.push('/notifications')}
            onDownloadLogs={() => {
                void (async () => {
                    let file: File | undefined
                    try {
                        await logInfo('settings', 'logs_export_requested')
                        const entries = await listAppLogs()
                        const filename = `plans-tracker-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
                        file = new File(Paths.cache, filename)
                        file.create()
                        file.write(formatAppLogs(entries))
                        if (!(await Sharing.isAvailableAsync())) {
                            throw new Error(
                                'System file sharing is unavailable on this platform',
                            )
                        }
                        await Sharing.shareAsync(file.uri, {
                            mimeType: 'text/plain',
                            UTI: 'public.plain-text',
                            dialogTitle: t('Журнал приложения'),
                        })
                        void logInfo('settings', 'logs_export_completed', {
                            entryCount: entries.length,
                            filename,
                        })
                    } catch (error) {
                        void logError('settings', 'logs_export_failed', error)
                        Alert.alert(
                            t('Не удалось скачать логи'),
                            t('Попробуйте ещё раз.'),
                        )
                    } finally {
                        try {
                            file?.delete()
                        } catch {
                            // Cache cleanup is best-effort; the export result is already determined.
                        }
                    }
                })()
            }}
            onClearLogs={() => {
                Alert.alert(
                    t('Очистить логи?'),
                    t('Все записи журнала за сегодня будут удалены.'),
                    [
                        { text: t('Отмена'), style: 'cancel' },
                        {
                            text: t('Очистить'),
                            style: 'destructive',
                            onPress: () => {
                                void clearAppLogs()
                            },
                        },
                    ],
                )
            }}
            onResetApp={
                __DEV__ || isTestFlightBuild()
                    ? () => {
                          Alert.alert(
                              t('Сбросить состояние приложения?'),
                              t(
                                  'Локальные задачи, привычки, календарь, настройки и запланированные напоминания будут удалены. Откроется онбординг.',
                              ),
                              [
                                  { text: t('Отмена'), style: 'cancel' },
                                  {
                                      text: t('Сбросить'),
                                      style: 'destructive',
                                      onPress: () => {
                                          void resetAppToFirstLaunch().catch(
                                              (error: unknown) => {
                                                  Alert.alert(
                                                      t(
                                                          'Не удалось сбросить приложение',
                                                      ),
                                                      error instanceof Error
                                                          ? error.message
                                                          : t(
                                                                'Попробуйте ещё раз.',
                                                            ),
                                                  )
                                              },
                                          )
                                      },
                                  },
                              ],
                          )
                      }
                    : undefined
            }
            taskDaysAhead={settings.taskDaysAhead}
            taskRecurrenceEnabled={settings.taskRecurrenceEnabled}
            onToggleTaskRecurrence={(value) => {
                void settingsRepository
                    .update({ taskRecurrenceEnabled: value })
                    .then(load)
            }}
            taskTimeEnabled={settings.taskTimeEnabled}
            onToggleTaskTime={(value) => {
                void settingsRepository
                    .update({ taskTimeEnabled: value })
                    .then(load)
            }}
            onChangeTaskDaysAhead={(value) => {
                void settingsRepository
                    .update({ taskDaysAhead: value })
                    .then(load)
            }}
            calendarOptions={calendarOptions}
            onChangeCalendarOptions={(patch) => {
                void calendarSettings
                    .update(patch)
                    .then(setCalendarOptions)
                    .catch(() =>
                        Alert.alert(
                            t('Не удалось сохранить настройки'),
                            t('Попробуйте ещё раз.'),
                        ),
                    )
            }}
            useGroups={settings.useGroups}
            usePriority={settings.usePriority}
            groups={groups}
            priorities={priorities}
            useHabitCategories={settings.useHabitCategories}
            habitCategories={habitCategories}
            accentName={selectedAccent}
            onClose={() => router.back()}
            onToggleGroups={(value) => {
                void settingsRepository.update({ useGroups: value }).then(load)
            }}
            onTogglePriority={(value) => {
                void settingsRepository
                    .update({ usePriority: value })
                    .then(load)
            }}
            onCreateGroup={(draft) => {
                void tasksRepository.createGroup(draft).then(load)
            }}
            onUpdateGroup={(id, draft) => {
                void tasksRepository.updateGroup(id, draft).then(load)
            }}
            onDeleteGroup={(id) => {
                void tasksRepository.removeGroup(id).then(load)
            }}
            onCreatePriority={(draft) => {
                void tasksRepository
                    .createPriority({
                        label: draft.label,
                        color: draft.color ?? undefined,
                    })
                    .then(load)
            }}
            onUpdatePriority={(id, draft) => {
                void tasksRepository
                    .updatePriority(id, {
                        label: draft.label,
                        color: draft.color ?? undefined,
                    })
                    .then(load)
            }}
            onDeletePriority={(id) => {
                void tasksRepository.removePriority(id).then(load)
            }}
            onToggleHabitCategories={(value) => {
                void settingsRepository
                    .update({ useHabitCategories: value })
                    .then(load)
            }}
            onCreateHabitCategory={(draft) => {
                void habitsRepository
                    .createCategory({
                        label: draft.label,
                        color: draft.color ?? undefined,
                    })
                    .then(load)
            }}
            onUpdateHabitCategory={(id, draft) => {
                void habitsRepository
                    .updateCategory(id, {
                        label: draft.label,
                        color: draft.color ?? undefined,
                    })
                    .then(load)
            }}
            onDeleteHabitCategory={(id) => {
                void habitsRepository.removeCategory(id).then(load)
            }}
            onChangeAccent={setAccentColor}
        />
    )
}
