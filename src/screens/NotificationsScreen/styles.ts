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
            paddingBottom: insets.bottom + 24,
        },
        sectionTitle: {
            paddingHorizontal: 16,
            paddingBottom: 8,
        },
        note: {
            paddingHorizontal: 16,
            paddingTop: 4,
        },
    })
}
