import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

export const useStyles = () => {
    const { colors } = useTheme()

    return StyleSheet.create({
        root: {
            width: '100%',
            height: 1,
            backgroundColor: colors.separator.opaque,
        },
    })
}
