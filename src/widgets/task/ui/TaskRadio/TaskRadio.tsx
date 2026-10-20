import { View } from 'react-native'

import { TODO_STATUS_ID } from '@/shared/api'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { Icon } from '@/shared/ui/Icon'

import type { TaskRadioProps } from './model'

const DEFAULT_SIZE = 24

/**
 * Left-of-row completion indicator. Overdue (red, solid outline, still
 * hollow — the task isn't done, it's just late) takes priority over
 * everything else — it's the one state the user needs to notice first,
 * regardless of which status the task was actually in when it slipped.
 */
export function TaskRadio({
    status,
    isOverdue,
    size = DEFAULT_SIZE,
}: TaskRadioProps) {
    const { colors } = useTheme()
    const statusColor = useThemeColor(status.color ?? 'labels-tertiary')
    const dimension = { width: size, height: size, borderRadius: size / 2 }

    if (isOverdue) {
        return (
            <View
                style={[
                    dimension,
                    { borderWidth: 2, borderColor: colors.accent.red },
                ]}
            />
        )
    }

    if (status.isCompleted) {
        return (
            <View
                style={[
                    dimension,
                    {
                        backgroundColor: colors.brand,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                ]}
            >
                <Icon
                    name="check-outline"
                    size={size * 0.6}
                    nativeColor={colors.gray.white}
                />
            </View>
        )
    }

    if (status.id === TODO_STATUS_ID) {
        return (
            <View
                style={[
                    dimension,
                    { borderWidth: 2, borderColor: colors.gray.gray },
                ]}
            />
        )
    }

    // A custom, not-yet-completion status — dashed and colored with the
    // status's own color, distinct from plain "todo"'s solid gray ring.
    return (
        <View
            style={[
                dimension,
                {
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: statusColor,
                },
            ]}
        />
    )
}
