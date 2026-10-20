import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()

    return StyleSheet.create({
        card: {
            backgroundColor: colors.backgroundGrouped.secondary,
            borderRadius: 26,
            // Square-cornered filled children (e.g. Skeleton rows with
            // borderRadius={0}, meant to butt up against each other flush)
            // must not visibly square off this card's own rounded corners.
            overflow: 'hidden',
        },
    })
}
