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
        colorDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            alignSelf: 'center',
        },
        sectionTitle: {
            paddingHorizontal: 16,
            paddingBottom: 8,
        },
        accentPickerCard: {
            width: '100%',
        },
        stepperRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        stepperValue: {
            minWidth: 22,
            textAlign: 'center',
        },
    })
}
