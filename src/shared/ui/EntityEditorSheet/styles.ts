import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        contentClip: {
            overflow: 'hidden',
        },
        editorBody: {
            gap: 20,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        inputWrap: {
            minHeight: 52,
            borderRadius: 26,
            overflow: 'hidden',
        },
        input: {
            minHeight: 52,
            paddingHorizontal: 14,
            fontSize: 17,
        },
        footer: {
            flexDirection: 'row',
            gap: 12,
        },
        deletePlaceholder: {
            paddingHorizontal: 4,
        },
        deleteAnimation: {
            width: 96,
            height: 96,
        },
    })
