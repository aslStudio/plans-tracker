import { StyleSheet } from 'react-native'

export const useStyles = () => {
    return StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
        },
        icon: {
            width: 48,
            height: 48,
        },
        texts: {
            flex: 1,
            gap: 2,
        },
    })
}
