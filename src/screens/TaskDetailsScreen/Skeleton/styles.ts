import { StyleSheet } from 'react-native'

export const useSkeletonStyles = () =>
    StyleSheet.create({
        title: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 14 },
        // Mirrors `Row`'s own layout (`shared/ui/Row/styles.ts`) so a
        // placeholder row sits at the same height as the real one it precedes.
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 52,
            paddingVertical: 10,
            paddingHorizontal: 16,
        },
        rowSpacer: { flex: 1 },
        paragraph: { padding: 16, gap: 10 },
    })
