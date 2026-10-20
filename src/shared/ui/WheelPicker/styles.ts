import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
        },
        columns: {
            flexDirection: 'row',
        },
        picker: {
            minWidth: 0,
        },
        footer: {
            flexDirection: 'row',
            gap: 12,
            paddingTop: 8,
        },
    })
