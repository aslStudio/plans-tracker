import type { NotificationSettings } from '@/shared/api'

export type NotificationsScreenProps = {
    settings: NotificationSettings
    /** True once the user has explicitly denied the system permission — the master toggle then links out to system settings instead of re-prompting. */
    permissionDenied: boolean
    onClose: () => void
    onToggleEnabled: (value: boolean) => void
    onChangeSettings: (patch: Partial<NotificationSettings>) => void
    onOpenSystemSettings: () => void
}
