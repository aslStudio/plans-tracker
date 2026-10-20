import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        sectionTitle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 8,
            paddingTop: 8,
        },
        sectionActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        emptyDay: {
            minHeight: 160,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
        },
        emptyButton: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingBottom: 8,
        },
        emptyLottie: { width: 40, height: 40 },
    })
