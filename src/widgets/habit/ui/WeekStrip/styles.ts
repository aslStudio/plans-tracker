import { StyleSheet } from 'react-native'

export const DOT_SIZE = 9
export const SMALL_DOT_SIZE = 5

export const useStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        dot: {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        smallDot: {
            width: SMALL_DOT_SIZE,
            height: SMALL_DOT_SIZE,
            borderRadius: SMALL_DOT_SIZE / 2,
        },
        dueRing: {
            borderWidth: 1.5,
        },
    })
