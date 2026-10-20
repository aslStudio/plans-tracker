import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },
        row: { flexDirection: 'row' as const, gap: 6 },
        weekLabel: {
            flex: 1,
            textAlign: 'center' as const,
            paddingVertical: 14,
            fontSize: 11,
        },
        cell: {
            flex: 1,
            minHeight: 106,
            borderTopWidth: 1,
            paddingTop: 10,
            paddingHorizontal: 3,
            borderRadius: 8,
        },
        dayLabel: { marginBottom: 8 },
        item: {
            borderLeftWidth: 2,
            paddingLeft: 3,
            marginBottom: 5,
        },
        itemTitle: { fontSize: 9 },
        overflowLabel: { fontSize: 10 },
    })
