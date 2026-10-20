import { StyleSheet } from 'react-native'

// Mirrors the `HOUR_HEIGHT` exported from `CalendarTimeline.tsx` — kept as a
// plain duplicate here rather than imported, since importing it back would
// make this file and the component import each other.
const HOUR_HEIGHT = 76

export const useStyles = () =>
    StyleSheet.create({
        viewport: { flex: 1 },
        scrollContent: { paddingBottom: 110 },
        canvas: { height: HOUR_HEIGHT * 24, marginTop: 14 },
        hour: {
            position: 'absolute' as const,
            left: 0,
            right: 16,
            flexDirection: 'row' as const,
        },
        hourLabel: {
            width: 60,
            textAlign: 'center' as const,
            fontSize: 10,
            marginTop: -7,
            fontVariant: ['tabular-nums'] as const,
        },
        hourSlot: { flex: 1, borderTopWidth: 1 },
        halfHourSlot: { flex: 1 },
        events: {
            position: 'absolute' as const,
            top: 0,
            bottom: 0,
            left: 64,
            right: 16,
        },
        event: {
            position: 'absolute' as const,
            borderRadius: 10,
            borderLeftWidth: 3,
            paddingHorizontal: 9,
            paddingVertical: 6,
            overflow: 'hidden' as const,
        },
        eventTitle: { fontSize: 13, fontWeight: '700' as const },
        eventTime: { fontSize: 11, marginTop: 3 },
        eventLinkBadge: { fontSize: 10, marginTop: 6 },
        nowLine: {
            position: 'absolute' as const,
            left: 57,
            right: 16,
            height: 1.5,
        },
        nowDot: {
            position: 'absolute' as const,
            left: -3,
            top: -3,
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        drop: {
            position: 'absolute' as const,
            left: 62,
            right: 16,
            height: HOUR_HEIGHT / 2,
            borderRadius: 10,
            borderWidth: 1.5,
            padding: 6,
        },
        dropLabel: { fontWeight: '700' as const, fontSize: 12 },
        allDayTitle: { fontSize: 12, fontWeight: '600' as const },
        allDaySubtitle: { fontSize: 10, marginTop: 5 },
    })
