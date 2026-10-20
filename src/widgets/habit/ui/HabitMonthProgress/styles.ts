import { StyleSheet } from 'react-native'

export const CELL_SIZE = 32

export const useStyles = () =>
    StyleSheet.create({
        root: { gap: 12 },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        weekdayRow: {
            flexDirection: 'row',
        },
        weekdayCell: {
            flex: 1,
            alignItems: 'center',
        },
        row: {
            flexDirection: 'row',
        },
        cell: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 2,
        },
        dot: {
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderRadius: CELL_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        summary: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
    })
