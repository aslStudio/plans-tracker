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
            gap: 16,
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
        weekdayChips: {
            flexDirection: 'row',
            gap: 6,
            paddingHorizontal: 16,
            paddingBottom: 16,
        },
        weekdayChip: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 8,
            borderRadius: 14,
            backgroundColor: colors.backgroundGrouped.primary,
        },
        weekdayChipActive: {
            backgroundColor: colors.brandSecondary,
        },
        progressTitle: {
            paddingHorizontal: 16,
            paddingBottom: 12,
        },
        progressContent: {
            padding: 16,
        },
        floatingSaveButton: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 16,
        },
    })
}
