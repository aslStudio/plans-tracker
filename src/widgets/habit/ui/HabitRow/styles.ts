import { StyleSheet } from 'react-native'

export const RADIO_SIZE = 28

export const useStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 60,
            paddingVertical: 10,
            paddingHorizontal: 16,
            gap: 12,
        },
        radio: {
            width: RADIO_SIZE,
            height: RADIO_SIZE,
            borderRadius: RADIO_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        radioDue: {
            borderWidth: 2,
        },
        radioNotDue: {
            width: 8,
            height: 8,
            borderRadius: 4,
            alignSelf: 'center',
        },
        content: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        texts: {
            flex: 1,
            minWidth: 0,
            gap: 4,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        titleStrikethrough: { textDecorationLine: 'line-through' as const },
    })
