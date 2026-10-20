import { StyleSheet } from 'react-native'

export const useSkeletonStyles = () =>
    StyleSheet.create({
        root: { flex: 1 },
        content: { paddingTop: 72, paddingBottom: 80 },
        title: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 14 },
        palette: {
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 16,
            paddingBottom: 16,
        },
        swatch: { width: 34, height: 34 },
        // Mirrors `Row`'s own layout (`shared/ui/Row/styles.ts`) so a
        // placeholder row sits at the same height as the real one it precedes.
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 52,
            paddingVertical: 10,
            paddingHorizontal: 16,
            gap: 12,
        },
        rowIcon: { width: 21, height: 21 },
        rowTexts: { flex: 1, gap: 6 },
    })
