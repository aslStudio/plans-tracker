import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'center' as const,
        },
        scrim: {
            ...StyleSheet.absoluteFill,
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
        },
        content: {
            flex: 1,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            paddingHorizontal: 24,
        },
        messageCard: {
            width: '100%' as const,
            maxWidth: 360,
            alignItems: 'center' as const,
            paddingHorizontal: 24,
            paddingVertical: 28,
            gap: 14,
            borderRadius: 30,
            shadowColor: '#000',
            shadowOpacity: 0.16,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 14 },
            elevation: 16,
        },
        animationSurface: {
            width: 104,
            height: 104,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            borderRadius: 32,
            marginBottom: 2,
        },
        warningAnimation: {
            width: 92,
            height: 92,
        },
        centerText: {
            textAlign: 'center' as const,
        },
        button: {
            position: 'absolute' as const,
            left: 24,
            right: 24,
            bottom: 32,
            maxWidth: 360,
            alignSelf: 'center' as const,
        },
    })
