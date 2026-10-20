import { updateWidgetLanguage } from '../../modules/calendar-widget-data'
import { LanguageProvider } from '@/shared/lib/i18n/LanguageProvider'
import { t, useLanguage } from '@/shared/lib/i18n'
import {
    DarkTheme,
    DefaultTheme,
    Stack,
    ThemeProvider,
    usePathname,
} from 'expo-router'
import {
    initializeMemory,
    hydrateArchive,
    syncMemory,
} from '@/shared/lib/memory/service'
import {
    requestNotificationPermission,
    rescheduleNotifications,
    setUpNotificationChannel,
} from '@/features/manage-notification-settings'
import { tasksRepository } from '@/shared/api'
import { syncTaskWidget } from '@/features/sync-task-widget'
import { syncCalendarWidget } from '@/features/sync-calendar-widget'
import {
    applyPendingHabitToggles,
    syncHabitWidget,
} from '@/features/sync-habit-widget'
import {
    completeOnboarding,
    isOnboardingCompleted,
} from '@/features/complete-onboarding'
import { OnboardingScreen } from '@/screens/OnboardingScreen'
import { TheText } from '@/shared/ui/TheText'
import { TheButton } from '@/shared/ui/TheButton'
import { useEffect, useState } from 'react'
import { Alert, AppState, View } from 'react-native'
import { registerDevMenuItems } from 'expo-dev-menu'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useAppFonts } from '@/shared/config/fonts'
import { AppToastHost } from '@/shared/ui/AppToastHost/AppToastHost'
import { AccentProvider } from '@/shared/lib/theme/accent-provider'
import {
    ThemeModeProvider,
    useThemeMode,
} from '@/shared/lib/theme/theme-mode-provider'
import {
    logError,
    initializeAppLogger,
    logInfo,
} from '@/shared/lib/diagnostics/app-logger'
import { useStyles } from './_layout.styles'
import { resetAppToFirstLaunch } from '@/shared/lib/dev/reset-app-state'

function ReadyRootLayout() {
    useLanguage()

    const styles = useStyles()
    const [fontsLoaded] = useAppFonts()
    const [memoryReady, setMemoryReady] = useState(false)
    const [memoryError, setMemoryError] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
    useEffect(() => {
        if (!__DEV__) return
        // expo-dev-menu's native module is only present in a custom dev-client
        // build — registerDevMenuItems rejects (not throws) when it's missing,
        // e.g. when running in Expo Go, so this must stay caught.
        void registerDevMenuItems([
            {
                name: t('Сбросить приложение как при первом запуске'),
                shouldCollapse: true,
                callback: () => {
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
                                                    : t('Попробуйте ещё раз.'),
                                            )
                                        },
                                    )
                                },
                            },
                        ],
                    )
                },
            },
        ]).catch(() => {})
    }, [])
    useEffect(() => {
        void initializeMemory()
            .then(() => setMemoryReady(true))
            .catch((error) => {
                setMemoryError(true)
                void logError('memory', 'initialization_failed', error)
            })
    }, [attempt])
    useEffect(() => {
        void isOnboardingCompleted()
            .then(setOnboardingDone)
            .catch((error) => {
                setOnboardingDone(true)
                void logError('onboarding', 'status_check_failed', error)
            })
    }, [])

    return (
        <GestureHandlerRootView style={styles.fill}>
            <SafeAreaProvider>
                <ThemeModeProvider>
                    <AccentProvider>
                        {fontsLoaded &&
                        memoryReady &&
                        onboardingDone !== null ? (
                            onboardingDone ? (
                                <AppNavigationTheme />
                            ) : (
                                <OnboardingScreen
                                    onFinish={() => {
                                        setOnboardingDone(true)
                                        void completeOnboarding().catch(
                                            (error: unknown) =>
                                                logError(
                                                    'onboarding',
                                                    'complete_failed',
                                                    error,
                                                ),
                                        )
                                        void requestNotificationPermission()
                                            .then(rescheduleNotifications)
                                            .catch((error: unknown) =>
                                                logError(
                                                    'onboarding',
                                                    'notification_permission_failed',
                                                    error,
                                                ),
                                            )
                                    }}
                                />
                            )
                        ) : (
                            <View style={styles.errorScreen}>
                                {memoryError && (
                                    <>
                                        <TheText>
                                            {t(
                                                'Не удалось открыть данные. Повторите загрузку, чтобы безопасно завершить предыдущую операцию.',
                                            )}
                                        </TheText>
                                        <TheButton
                                            onPress={() => {
                                                setMemoryError(false)
                                                setAttempt((value) => value + 1)
                                            }}
                                        >
                                            {t('Повторить')}
                                        </TheButton>
                                    </>
                                )}
                            </View>
                        )}
                    </AccentProvider>
                </ThemeModeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}

function AppNavigationTheme() {
    const language = useLanguage()
    useEffect(() => {
        updateWidgetLanguage(language)
    }, [language])
    const styles = useStyles()
    const { resolvedScheme } = useThemeMode()
    const pathname = usePathname()

    useEffect(() => {
        void initializeAppLogger()
        void setUpNotificationChannel()
        let syncing = false
        const sync = async () => {
            if (syncing) return
            syncing = true
            try {
                await hydrateArchive()
                await syncMemory()
            } catch (error) {
                void logError('memory', 'automatic_sync_failed', error)
            } finally {
                syncing = false
            }
            try {
                // Before rescheduling/syncing widgets so both reflect
                // whatever the Habits widget's own tap-to-complete rows
                // queued while the app wasn't running, not just what was
                // already true at last launch.
                await applyPendingHabitToggles()
            } catch (error) {
                void logError(
                    'habit_widget',
                    'apply_pending_toggles_failed',
                    error,
                )
            }
            try {
                await syncTaskWidget()
            } catch (error) {
                void logError('task_widget', 'automatic_sync_failed', error)
            }
            try {
                await rescheduleNotifications()
            } catch (error) {
                void logError(
                    'notifications',
                    'automatic_reschedule_failed',
                    error,
                )
            }
            try {
                await syncCalendarWidget()
            } catch (error) {
                void logError('calendar_widget', 'automatic_sync_failed', error)
            }
            try {
                await syncHabitWidget()
            } catch (error) {
                void logError('habit_widget', 'automatic_sync_failed', error)
            }
        }
        let taskTimer: ReturnType<typeof setTimeout> | undefined
        const flushTasks = () => {
            clearTimeout(taskTimer)
            void syncTaskWidget().catch((error: unknown) =>
                logError('task_widget', 'automatic_sync_failed', error),
            )
        }
        const refreshTasks = () => {
            clearTimeout(taskTimer)
            taskTimer = setTimeout(flushTasks, 250)
        }
        const unsubscribeTasks = tasksRepository.subscribe(refreshTasks)
        void sync()
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') void sync()
            else flushTasks()
        })
        return () => {
            subscription.remove()
            unsubscribeTasks()
            clearTimeout(taskTimer)
        }
    }, [language])

    useEffect(() => {
        if (pathname) void logInfo('navigation', 'route_changed', { pathname })
    }, [pathname])

    return (
        <ThemeProvider
            value={resolvedScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <View style={styles.fill}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="statistics"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="widget-guide"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="task/[id]"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="habit/[id]"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="habit-streak"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="calendar"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="plan/[id]"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="memory"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="notifications"
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="settings"
                        options={{ presentation: 'modal' }}
                    />
                </Stack>
                <AppToastHost />
            </View>
        </ThemeProvider>
    )
}

export default function RootLayout() {
    return (
        <LanguageProvider>
            <ReadyRootLayout />
        </LanguageProvider>
    )
}
