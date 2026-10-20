import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    root: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12 },
    item: {
        flex: 1,
        minWidth: 0,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export const useStyles = () => styles
