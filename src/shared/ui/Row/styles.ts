import { StyleSheet } from 'react-native'

import type { Color } from '@/shared/config/color'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'

export const useStyles = () => {
    return StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 52,
            gap: 12,
        },
        inner: {
            flex: 1,
            minWidth: 0,
            gap: 2,
        },
        labelAccessoryRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        labelFlex: { flexShrink: 1 },
        labelPressable: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
    })
}

export const useBubbleStyles = (
    size: number,
    backgroundColor: Color,
    shape: 'circle' | 'squircle',
) => {
    const resolvedColor = useThemeColor(backgroundColor)

    return StyleSheet.create({
        root: {
            width: size,
            height: size,
            // A squircle's corner radius scales with size the way iOS's
            // continuous-corner icons do — a fixed radius would look
            // right at one size and wrong at another.
            borderRadius: shape === 'squircle' ? size * 0.28 : size / 2,
            backgroundColor: resolvedColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
    })
}
