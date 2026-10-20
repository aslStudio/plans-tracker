import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            minWidth: 220,
            borderRadius: 16,
            paddingVertical: 8,
            overflow: 'hidden',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
        },
        iconFlipped: {
            transform: [{ rotate: '180deg' }],
        },
    })
