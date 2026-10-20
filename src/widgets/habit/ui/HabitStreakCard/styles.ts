import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

const CHART_HEIGHT = 118

export const useStyles = () => {
    const { colors } = useTheme()

    return StyleSheet.create({
        cardBody: { padding: 16, gap: 10 },
        headerPressable: { gap: 10 },
        headerRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
        },
        titleColumn: { gap: 3 },
        streakBadge: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 5,
            paddingHorizontal: 9,
            paddingVertical: 5,
            borderRadius: 17,
            backgroundColor: colors.fill.tertiary,
        },
        badgeLottie: { width: 28, height: 28 },
        chartContainer: { height: CHART_HEIGHT, overflow: 'hidden' as const },
        selectOverlay: {
            position: 'absolute' as const,
            top: 0,
            height: CHART_HEIGHT,
            borderRadius: 18,
        },
        marker: {
            position: 'absolute' as const,
            left: 0,
            top: 0,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.brand,
            borderWidth: 2,
            borderColor: colors.background.elevated,
            shadowColor: colors.brand,
            shadowOpacity: 0.28,
            shadowRadius: 6,
            elevation: 3,
        },
        footerRow: {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            bottom: 1,
            flexDirection: 'row' as const,
            justifyContent: 'space-between' as const,
        },
    })
}
