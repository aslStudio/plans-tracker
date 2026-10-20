import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()

    return StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        skip: {
            position: 'absolute',
            top: insets.top + 12,
            right: 20,
            zIndex: 1,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        pager: {
            flex: 1,
        },
        pagerContent: {
            alignItems: 'center',
        },
        footer: {
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 8,
            gap: 20,
        },
    })
}
