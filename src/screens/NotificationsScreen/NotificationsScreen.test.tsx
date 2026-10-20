import { defaultNotificationSettings } from '@/shared/api'
import { fireEvent, render, screen } from '@/shared/lib/test-utils'

import { NotificationsScreen } from './NotificationsScreen'

const enabledSettings = { ...defaultNotificationSettings, enabled: true }

describe('NotificationsScreen', () => {
    it('calls onToggleEnabled when the master toggle is pressed', () => {
        const onToggleEnabled = jest.fn()
        render(
            <NotificationsScreen
                settings={enabledSettings}
                permissionDenied={false}
                onClose={() => {}}
                onToggleEnabled={onToggleEnabled}
                onChangeSettings={() => {}}
                onOpenSystemSettings={() => {}}
            />,
        )

        fireEvent(
            screen.getByTestId('notifications-enabled'),
            'valueChange',
            false,
        )

        expect(onToggleEnabled).toHaveBeenCalledWith(false)
    })

    it('links to system settings instead of showing a toggle once permission is denied', () => {
        render(
            <NotificationsScreen
                settings={enabledSettings}
                permissionDenied
                onClose={() => {}}
                onToggleEnabled={() => {}}
                onChangeSettings={() => {}}
                onOpenSystemSettings={() => {}}
            />,
        )

        expect(
            screen.getByText('Разрешение отклонено в системных настройках'),
        ).toBeTruthy()
        expect(screen.queryByTestId('notifications-enabled')).toBeNull()
    })

    it('calls onChangeSettings with the changed key when a group toggle is pressed', () => {
        const onChangeSettings = jest.fn()
        render(
            <NotificationsScreen
                settings={enabledSettings}
                permissionDenied={false}
                onClose={() => {}}
                onToggleEnabled={() => {}}
                onChangeSettings={onChangeSettings}
                onOpenSystemSettings={() => {}}
            />,
        )

        fireEvent(
            screen.getByTestId('notifications-tasks-overdue'),
            'valueChange',
            false,
        )

        expect(onChangeSettings).toHaveBeenCalledWith({ tasksOverdue: false })
    })

    it('shows an explanation sheet when a row label is pressed', () => {
        render(
            <NotificationsScreen
                settings={enabledSettings}
                permissionDenied={false}
                onClose={() => {}}
                onToggleEnabled={() => {}}
                onChangeSettings={() => {}}
                onOpenSystemSettings={() => {}}
            />,
        )

        fireEvent.press(screen.getByText('Серия под угрозой'))

        expect(
            screen.getByText(
                'В 20:00, за 4 часа до конца суток, если сегодняшняя серия ещё не закрыта, напомним, что времени остаётся немного.',
            ),
        ).toBeTruthy()
    })
})
