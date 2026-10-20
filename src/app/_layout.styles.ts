import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        fill: { flex: 1 },
        errorScreen: {
            flex: 1,
            justifyContent: 'center' as const,
            padding: 24,
            gap: 20,
        },
    })
