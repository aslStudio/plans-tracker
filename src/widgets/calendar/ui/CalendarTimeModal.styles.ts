import { StyleSheet } from 'react-native'

const ROW = 42
const VIEWPORT = 168

export const useStyles = () =>
    StyleSheet.create({
        content: { gap: 16 },
        modalTitle: { fontSize: 19, fontWeight: '700' as const },
        wheels: {
            flexDirection: 'row' as const,
            height: 208,
            alignItems: 'center' as const,
            gap: 10,
        },
        group: { flex: 1, minWidth: 0, gap: 4 },
        groupTitle: {
            fontSize: 12,
            fontWeight: '600' as const,
            textAlign: 'center' as const,
        },
        pair: {
            flexDirection: 'row' as const,
            height: VIEWPORT + 16,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        column: {
            flex: 1,
            minWidth: 0,
            height: VIEWPORT + 16,
            alignItems: 'stretch' as const,
        },
        unitLabel: {
            fontSize: 11,
            height: 16,
            textAlign: 'center' as const,
        },
        wheelViewport: { height: VIEWPORT, position: 'relative' as const },
        wheelContent: { paddingVertical: (VIEWPORT - ROW) / 2 },
        selection: {
            position: 'absolute' as const,
            top: (VIEWPORT - ROW) / 2,
            left: 0,
            right: 0,
            height: ROW,
            borderRadius: 11,
            opacity: 0.85,
        },
        value: {
            height: ROW,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            width: '100%' as const,
        },
        wheelItem: { fontSize: 22, fontWeight: '600' as const },
        colon: { fontSize: 20, fontWeight: '600' as const, paddingTop: 14 },
        divider: { width: 1, height: 126 },
        actions: { flexDirection: 'row' as const, gap: 12 },
    })
