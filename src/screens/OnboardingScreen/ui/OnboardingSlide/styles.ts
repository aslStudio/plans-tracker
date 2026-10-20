import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        root: {
            paddingHorizontal: 24,
        },
        animationWrap: {
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        animation: {
            width: 112,
            height: 112,
        },
        texts: {
            gap: 8,
            marginBottom: 32,
        },
        title: {
            textAlign: 'center',
        },
        description: {
            textAlign: 'center',
        },
        features: {
            gap: 20,
        },
    })
