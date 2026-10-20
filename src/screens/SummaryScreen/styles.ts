import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.backgroundGrouped.primary,
        },
        header: {
            paddingHorizontal: 16,
            paddingTop: insets.top + 8,
            paddingBottom: 8,
        },
        content: {
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 96,
            gap: 16,
        },
    })
}
