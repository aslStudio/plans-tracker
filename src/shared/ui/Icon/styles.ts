import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

const useStyles = (size: number) => {
    const theme = useTheme()
    return StyleSheet.create({
        root: {},
        ['skeleton-root']: {
            width: size,
            height: size,
            padding: (1 / 24) * size,
        },
        ['skeleton-circle']: {
            backgroundColor: theme.colors.fill.tertiary,
            width: '100%',
            height: '100%',
            borderRadius: (size - (1 / 24) * size) / 2,
        },
    })
}

export { useStyles }
