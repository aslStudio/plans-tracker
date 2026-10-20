import { StyleSheet } from 'react-native'

const CHART_HEIGHT = 118

export const useStyles = () => {
    return StyleSheet.create({
        cardBody: { padding: 16, gap: 10 },
        titleColumn: { gap: 3 },
        chartContainer: { height: CHART_HEIGHT, overflow: 'hidden' as const },
        footerRow: {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            bottom: 1,
            flexDirection: 'row' as const,
            justifyContent: 'space-between' as const,
        },
        statisticsLottie: { width: 40, height: 40 },
    })
}
