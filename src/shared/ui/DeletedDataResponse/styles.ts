import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()

    return StyleSheet.create({
        lottie: { width: 88, height: 88 },
        container: {
            flex: 1,
            backgroundColor: colors.backgroundGrouped.primary,
        },
        center: {
            flex: 1,
            justifyContent: 'center' as const,
            padding: 24,
        },
    })
}
