import { StyleSheet } from 'react-native'

export const useStyles = () => {
    return StyleSheet.create({
        flex: {
            flex: 1,
        },
        root: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        wrapper: {
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
        },
        loading: {
            ...StyleSheet.absoluteFill,
            alignItems: 'center',
            justifyContent: 'center',
        },
    })
}
