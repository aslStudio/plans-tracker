import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        ring: {
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        svgOverlay: { position: 'absolute' as const },
    })
