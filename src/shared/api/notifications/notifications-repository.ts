import { createLocalValueStore } from '../common/local-value-store'
import { defaultNotificationSettings, type NotificationSettings } from './model'

const store = createLocalValueStore<NotificationSettings>(
    'plans-tracker.notification-settings',
    defaultNotificationSettings,
)

export const notificationsRepository = {
    get(): Promise<NotificationSettings> {
        return store.get()
    },
    update(
        patch: Partial<NotificationSettings>,
    ): Promise<NotificationSettings> {
        return store.update(patch)
    },
}

export type NotificationsRepository = typeof notificationsRepository
