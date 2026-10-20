import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        modalSafeArea: {
            flex: 1,
        },
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
        streakBadge: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            paddingHorizontal: 32,
            paddingVertical: 18,
            gap: 12,
            borderRadius: 100,
            shadowColor: '#000',
            shadowOpacity: 0.14,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 14,
        },
        streakAnimation: {
            width: 82,
            height: 82,
        },
        streakNumber: {
            fontSize: 64,
            lineHeight: 72,
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
