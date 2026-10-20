import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        root: { padding: 16 },
        toggleRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
        },
        body: { paddingTop: 12, gap: 12 },
        timeRow: { paddingVertical: 8 },
        label: { fontSize: 16 },
        chipsRow: {
            flexDirection: 'row' as const,
            flexWrap: 'wrap' as const,
            gap: 8,
        },
        chip: { padding: 10, borderRadius: 12 },
    })
