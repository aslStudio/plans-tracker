import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()

    return StyleSheet.create({
        root: { padding: 12 },
        formatRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
        },
        marksGroup: {
            flexDirection: 'row',
            gap: 6,
        },
        formatPin: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.backgroundGrouped.primary,
        },
        editor: {
            minHeight: 72,
            fontSize: 16,
            lineHeight: 24,
            color: colors.labels.primary,
        },
    })
}
