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
        content: {
            // A bit less than the header's own full height — sitting
            // exactly flush with its bottom edge left "Сегодня" looking far
            // away from the header; the blur's fade is soft enough that
            // overlapping it slightly reads fine.
            paddingTop: getAppHeaderHeight(false, insets.top) - 16,
            paddingBottom: insets.bottom + 96,
        },
    })
}
