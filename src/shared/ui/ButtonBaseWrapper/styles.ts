import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        wrapper: {
            alignSelf: 'flex-start' as const,
            flexGrow: 0,
            flexShrink: 0,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        },
        hostOverflow: { overflow: 'hidden' as const },
        content: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: 8,
        },
    })
