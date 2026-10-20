import { View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

import type { WeekStripProps } from './model'
import { useStyles } from './styles'

/** The row's own mini history for the current week — a filled dot for a completed due day, a plain ring for a missed one, and a tiny centered dim dot for a day the habit wasn't due (or hasn't happened yet). Not interactive, just a glance at the week. */
export function WeekStrip({ days }: WeekStripProps) {
    const styles = useStyles()
    const { colors } = useTheme()

    return (
        <View style={styles.root}>
            {days.map((day) => {
                if (day.state === 'done') {
                    return (
                        <View
                            key={day.date}
                            style={[
                                styles.dot,
                                { backgroundColor: colors.brand },
                            ]}
                        />
                    )
                }
                if (day.state === 'missed') {
                    return (
                        <View
                            key={day.date}
                            style={[
                                styles.dot,
                                styles.dueRing,
                                { borderColor: colors.labels.tertiary },
                            ]}
                        />
                    )
                }
                return (
                    <View key={day.date} style={styles.dot}>
                        <View
                            style={[
                                styles.smallDot,
                                { backgroundColor: colors.fill.tertiary },
                            ]}
                        />
                    </View>
                )
            })}
        </View>
    )
}
