import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        },
        dot: {
            height: 8,
            borderRadius: 4,
        },
    })
