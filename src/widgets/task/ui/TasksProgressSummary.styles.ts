import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        row: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 14,
            padding: 16,
        },
        texts: { flex: 1, gap: 4 },
    })
