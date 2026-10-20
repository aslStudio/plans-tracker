import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { getAppHeaderHeight } from '@/shared/ui/AppHeader'

export const useStyles = () => {
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.backgroundGrouped.primary,
        },
        content: {
            paddingTop: getAppHeaderHeight(true, insets.top),
            paddingBottom: 48,
            gap: 14,
        },
        streakNote: { paddingHorizontal: 16, paddingVertical: 8 },
        streakCard: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            paddingVertical: 20,
            paddingHorizontal: 18,
            gap: 16,
        },
        streakLottie: { width: 88, height: 88 },
        streakTextWrap: { flex: 1 },
        streakCountRow: {
            flexDirection: 'row' as const,
            alignItems: 'baseline' as const,
            gap: 7,
        },
        progressCard: { padding: 16, gap: 16 },
        progressHeader: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
        },
        progressHeaderLabels: { gap: 2 },
        monthTitle: { textTransform: 'capitalize' as const },
        progressHeaderActions: { flexDirection: 'row' as const, gap: 8 },
        weekdayRow: { flexDirection: 'row' as const },
        weekdayCell: { flex: 1, alignItems: 'center' as const },
        grid: {
            flexDirection: 'row' as const,
            flexWrap: 'wrap' as const,
            rowGap: 9,
        },
        blankCell: { width: '14.2857%' as const, height: 43 },
        dayCell: {
            width: '14.2857%' as const,
            alignItems: 'center' as const,
            height: 43,
        },
        dayBubble: {
            width: 36,
            height: 36,
            borderRadius: 14,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        progressBarTrack: {
            position: 'absolute' as const,
            bottom: 1,
            width: 18,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.fill.tertiary,
            overflow: 'hidden' as const,
        },
        progressBarFill: { height: '100%' as const, borderRadius: 2 },
        legendRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 7,
        },
        legendDotDone: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.brand,
        },
        legendDotPartial: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.accent.orange,
            marginLeft: 8,
        },
        detailCard: { padding: 16, gap: 12 },
        detailHeader: {
            flexDirection: 'row' as const,
            alignItems: 'baseline' as const,
            justifyContent: 'space-between' as const,
        },
        emptyPlaceholder: { paddingVertical: 18, paddingHorizontal: 12 },
        habitRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 10,
            paddingVertical: 3,
        },
        habitCheckboxEmpty: {
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1.5,
            borderColor: colors.labels.tertiary,
        },
        habitLabelStrikethrough: {
            textDecorationLine: 'line-through' as const,
        },
    })
}
