import React from 'react'
import { Platform, Switch } from 'react-native'

import { hapticSelect } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'

import { type ToggleProps } from './model'

/** Thin theme-colored wrapper around RN's native `Switch` — the platform's own toggle, not a hand-rolled one. */
export const Toggle: React.FC<ToggleProps> = ({
    value,
    onChange,
    disabled,
    testID,
    accessibilityLabel,
}) => {
    const { colors } = useTheme()

    function handleValueChange(next: boolean) {
        // iOS's UISwitch already fires its own system haptic on toggle —
        // Android's Switch doesn't, so only add it there.
        if (Platform.OS === 'android') hapticSelect()
        onChange(next)
    }

    return (
        <Switch
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            value={value}
            onValueChange={handleValueChange}
            disabled={disabled}
            trackColor={{ false: colors.fill.tertiary, true: colors.brand }}
            thumbColor={colors.gray.white}
            ios_backgroundColor={colors.fill.tertiary}
        />
    )
}
