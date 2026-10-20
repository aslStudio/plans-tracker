import { StyleSheet } from 'react-native'

export const useStyles = () => {
    return StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 52,
            paddingVertical: 10,
            paddingHorizontal: 16,
            gap: 12,
        },
        content: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        texts: {
            flex: 1,
            minWidth: 0,
            gap: 2,
        },
        titleStrikethrough: {
            textDecorationLine: 'line-through',
        },
    })
}
