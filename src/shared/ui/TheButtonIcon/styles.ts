import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        fill: {
            width: '100%' as const,
            height: '100%' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        loaderOverlay: { position: 'absolute' as const },
    })
