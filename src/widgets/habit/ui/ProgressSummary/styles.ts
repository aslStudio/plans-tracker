import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()

    return StyleSheet.create({
        // The card shell — stays put. `overflow: hidden` keeps the sliding
        // content inside from poking out past the rounded corners while a
        // day transition is mid-flight.
        root: {
            marginHorizontal: 16,
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.backgroundGrouped.secondary,
            overflow: 'hidden',
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
        },
        texts: { flex: 1, gap: 4 },
    })
}
