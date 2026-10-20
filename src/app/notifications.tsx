import { useFocusEffect, useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useCallback, useState } from 'react'
import { Linking } from 'react-native'

import {
    defaultNotificationSettings,
    notificationsRepository,
} from '@/shared/api'
import type { NotificationSettings } from '@/shared/api'
import {
    requestNotificationPermission,
    rescheduleNotifications,
} from '@/features/manage-notification-settings'
import { logError } from '@/shared/lib/diagnostics/app-logger'

import { NotificationsScreen } from '@/screens/NotificationsScreen'

export default function NotificationsRoute() {
    const router = useRouter()
    const [settings, setSettings] = useState<NotificationSettings>(
        defaultNotificationSettings,
    )
    const [permissionDenied, setPermissionDenied] = useState(false)

    const load = useCallback(async () => {
        const [nextSettings, permission] = await Promise.all([
            notificationsRepository.get(),
            Notifications.getPermissionsAsync(),
        ])
        setSettings(nextSettings)
        setPermissionDenied(permission.status === 'denied')
    }, [])

    useFocusEffect(
        useCallback(() => {
            void load()
        }, [load]),
    )

    function reschedule() {
        void rescheduleNotifications().catch((error) =>
            logError('notifications', 'reschedule_failed', error),
        )
    }

    return (
        <NotificationsScreen
            settings={settings}
            permissionDenied={permissionDenied}
            onClose={() => router.back()}
            onToggleEnabled={(value) => {
                void (
                    value
                        ? requestNotificationPermission()
                        : notificationsRepository.update({ enabled: false })
                )
                    .then(load)
                    .then(reschedule)
            }}
            onChangeSettings={(patch) => {
                void notificationsRepository
                    .update(patch)
                    .then(load)
                    .then(reschedule)
            }}
            onOpenSystemSettings={() => {
                void Linking.openSettings()
            }}
        />
    )
}
