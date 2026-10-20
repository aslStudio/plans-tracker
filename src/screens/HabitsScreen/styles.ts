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
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        // Same reasoning as TasksScreen's own content padding — a bit less
        // than the header's full height so the summary card sits close to it.
        content: {
            paddingTop: getAppHeaderHeight(false, insets.top) - 16,
            paddingBottom: insets.bottom + 96,
            gap: 16,
        },
        dayTransition: { overflow: 'hidden' },
        statisticsLottie: { width: 40, height: 40 },
        emptyLottie: { width: 40, height: 40 },
        emptyAction: { paddingHorizontal: 16, paddingBottom: 8 },
        dayHeader: {
            paddingHorizontal: 16,
            paddingBottom: 9,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        dayLabelCapitalize: { textTransform: 'capitalize' },
    })
}
