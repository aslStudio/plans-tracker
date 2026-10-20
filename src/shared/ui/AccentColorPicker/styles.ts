import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: 'row',
            gap: 8,
        },
        // `flex: 1` + `aspectRatio: 1` instead of a fixed size — however many
        // swatches there are, they divide the available width evenly and
        // always fit on one line instead of wrapping — same as `AppAccentPicker`.
        swatch: {
            flex: 1,
            aspectRatio: 1,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
        },
        noColorStrike: {
            position: 'absolute',
            width: '70%',
            height: 1.5,
            transform: [{ rotate: '45deg' }],
        },
    })
