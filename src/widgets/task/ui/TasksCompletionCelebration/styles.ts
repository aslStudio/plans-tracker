import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        modalSafeArea: {
            flex: 1,
        },
        overlay: {
            flex: 1,
        },
        scrim: {
            ...StyleSheet.absoluteFill,
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
        },
        content: {
            flex: 1,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            paddingHorizontal: 24,
        },
        centerStage: {
            flex: 1,
            width: '100%' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: 24,
        },
        artCard: {
            width: 152,
            height: 152,
            borderRadius: 48,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            shadowColor: '#000',
            shadowOpacity: 0.14,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 14,
        },
        doneAnimation: {
            width: 132,
            height: 132,
        },
        message: {
            width: '100%' as const,
            maxWidth: 360,
            alignItems: 'center' as const,
            gap: 10,
        },
        centerText: {
            textAlign: 'center' as const,
        },
        button: {
            position: 'absolute' as const,
            left: 24,
            right: 24,
            maxWidth: 360,
            alignSelf: 'center' as const,
        },
    })
