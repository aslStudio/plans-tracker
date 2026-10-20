import { StyleSheet } from 'react-native'

export const useStyles = () =>
    StyleSheet.create({
        // Matches TasksScreen's own `sectionTitle` spacing.
        sectionTitle: {
            paddingHorizontal: 16,
            paddingBottom: 8,
            paddingTop: 16,
        },
        sectionTitleText: {
            width: 90,
            height: 20,
        },
        // Matches TaskRow's own layout (radio + title/description column).
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 52,
            paddingVertical: 10,
            paddingHorizontal: 16,
            gap: 12,
        },
        radio: {
            width: 24,
            height: 24,
        },
        rowTexts: {
            flex: 1,
            gap: 6,
        },
        titleLine: {
            height: 16,
        },
        descriptionLine: {
            width: '55%',
            height: 12,
        },
    })
