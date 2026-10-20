import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        content: { gap: 16 },
        modalTitle: {
            fontSize: 19,
            fontWeight: '700' as const,
            marginBottom: 4,
        },
        header: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            marginBottom: 10,
        },
        arrow: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        monthLabel: { fontSize: 17, fontWeight: '700' as const },
        row: { flexDirection: 'row' as const },
        weekday: {
            width: `${100 / 7}%`,
            textAlign: 'center' as const,
            paddingVertical: 9,
            fontSize: 12,
        },
        dayCell: {
            width: `${100 / 7}%`,
            height: 42,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        day: {
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        dayLabel: { fontSize: 15 },
        footer: { flexDirection: 'row' as const, gap: 12 },
    })
