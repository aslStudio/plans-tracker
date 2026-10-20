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
            paddingTop: getAppHeaderHeight(true, insets.top) + 8,
            paddingBottom: insets.bottom + 8,
        },
        loadingIndicator: { margin: 32 },
        usage: { padding: 22, gap: 14 },
        bar: {
            height: 12,
            borderRadius: 6,
            overflow: 'hidden' as const,
            flexDirection: 'row' as const,
            gap: 3,
            marginVertical: 8,
        },
        cloud: {
            flexDirection: 'row' as const,
            justifyContent: 'space-between' as const,
            gap: 12,
        },
        groupDot: { width: 10, height: 10, borderRadius: 5 },
        heading: { marginLeft: 16, marginBottom: 10 },
        note: { padding: 16, gap: 12 },
        footer: { marginHorizontal: 32, marginBottom: 16 },
        modalTint: { backgroundColor: 'rgba(0,0,0,0.16)' },
        modalContent: { flex: 1, paddingHorizontal: 20 },
        modalCenter: { flex: 1, justifyContent: 'center' as const },
        response: { padding: 24, borderRadius: 32 },
        operationLottie: { width: 124, height: 124 },
    })
}
