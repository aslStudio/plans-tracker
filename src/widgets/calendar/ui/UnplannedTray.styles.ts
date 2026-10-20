import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        tray: { paddingTop: 12, paddingBottom: 10 },
        heading: {
            paddingHorizontal: 22,
            marginBottom: 10,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
        },
        headingLabel: { fontSize: 12, fontWeight: '600' as const },
        horizontalScroll: { flexGrow: 0, flexShrink: 0 },
        cards: { paddingHorizontal: 20, gap: 10 },
        card: {
            width: 216,
            minHeight: 62,
            borderRadius: 17,
            borderWidth: StyleSheet.hairlineWidth,
            padding: 13,
            flexDirection: 'row' as const,
            gap: 10,
            alignItems: 'center' as const,
        },
        dot: { width: 7, height: 7, borderRadius: 4 },
        cardTexts: { flex: 1, gap: 5 },
        cardTitle: { fontWeight: '600' as const, fontSize: 13 },
        cardSubtitle: { fontSize: 10 },
    })
