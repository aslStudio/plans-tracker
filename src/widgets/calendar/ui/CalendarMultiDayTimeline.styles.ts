import { StyleSheet } from 'react-native'

// Mirrors `HOUR_HEIGHT` in `CalendarMultiDayTimeline.tsx` — kept as a plain
// duplicate rather than imported, same reasoning as `CalendarTimeline.styles.ts`.
const HOUR_HEIGHT = 64
const GUTTER_WIDTH = 44

export const useStyles = () =>
    StyleSheet.create({
        root: { flex: 1, paddingRight: 12 },
        headerRow: {
            flexDirection: 'row' as const,
            paddingTop: 2,
            paddingBottom: 8,
        },
        gutter: { width: GUTTER_WIDTH },
        headerCell: {
            flex: 1,
            alignItems: 'center' as const,
            gap: 7,
            paddingTop: 11,
            paddingBottom: 7,
            marginHorizontal: 2,
            borderRadius: 19,
        },
        headerWeekday: { fontSize: 11 },
        headerDay: { fontSize: 20, fontWeight: '600' as const },
        dot: { width: 4, height: 4, borderRadius: 2 },
        eventTime: { fontSize: 10, marginTop: 3 },
        allDayRow: {
            flexDirection: 'row' as const,
            paddingBottom: 6,
        },
        allDayColumn: { flex: 1, gap: 3, marginHorizontal: 2 },
        allDayChip: {
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 3,
        },
        allDayChipText: { fontSize: 10, fontWeight: '600' as const },
        scrollContent: { paddingBottom: 110 },
        grid: {
            flexDirection: 'row' as const,
            height: HOUR_HEIGHT * 24,
            marginTop: 12,
        },
        hourLabel: {
            position: 'absolute' as const,
            left: -GUTTER_WIDTH,
            width: GUTTER_WIDTH,
            textAlign: 'center' as const,
            fontSize: 10,
            marginTop: -6,
            fontVariant: ['tabular-nums'] as const,
        },
        hourLine: {
            position: 'absolute' as const,
            left: GUTTER_WIDTH,
            right: 0,
            borderTopWidth: 1,
        },
        column: {
            flex: 1,
            overflow: 'hidden' as const,
        },
        slot: { height: HOUR_HEIGHT / 2 },
        event: {
            position: 'absolute' as const,
            left: 1,
            right: 1,
            borderRadius: 8,
            borderLeftWidth: 3,
            paddingHorizontal: 4,
            paddingVertical: 4,
            overflow: 'hidden' as const,
        },
        eventTitle: { fontSize: 10, fontWeight: '700' as const },
        nowLine: {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            height: 1.5,
        },
        nowDot: {
            position: 'absolute' as const,
            left: -3,
            top: -3,
            width: 7,
            height: 7,
            borderRadius: 3.5,
        },
    })
