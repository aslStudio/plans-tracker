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
        // Extra room so the last card never ends up hidden behind the
        // floating "Сохранить" button sitting on top of it.
        content: {
            paddingTop: getAppHeaderHeight(true, insets.top),
            paddingBottom: insets.bottom + 96,
        },
        noteInput: {
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: 50,
            fontSize: 16,
            lineHeight: 22,
            color: colors.labels.primary,
            textAlignVertical: 'top',
        },
        titleInput: {
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            minHeight: 56,
            textAlignVertical: 'top',
        },
        floatingSaveButton: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 16,
        },
        recurrenceHeading: { paddingHorizontal: 16, paddingTop: 14 },
        recurrenceTitle: {
            color: colors.labels.primary,
            fontSize: 16,
            fontWeight: '600' as const,
        },
        recurrenceSubtitle: {
            color: colors.labels.secondary,
            fontSize: 13,
            marginTop: 4,
        },
        horizontalScroll: { flexGrow: 0, flexShrink: 0 },
        chipRow: {
            flexDirection: 'row' as const,
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 14,
        },
        weekdayChipRow: {
            flexDirection: 'row' as const,
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 14,
        },
        chip: {
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 16,
        },
        chipLabel: { fontWeight: '600' as const },
        weekdayChip: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        weekdayChipLabel: { fontWeight: '600' as const },
    })
}
