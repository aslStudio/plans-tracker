import * as Haptics from 'expo-haptics'

/** For a plain tap — buttons, rows, list items. */
export function hapticTap() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/** For picking one of several options — segments, swatches, tabs. */
export function hapticSelect() {
    void Haptics.selectionAsync()
}

/** For a toast confirming something succeeded. */
export function hapticSuccess() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
