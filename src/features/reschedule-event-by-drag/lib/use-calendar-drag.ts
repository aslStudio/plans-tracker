import { useCallback, useEffect, useRef, useState } from 'react'
import { type ScrollView, type View } from 'react-native'
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { hapticSelect } from '@/shared/lib/haptics'
import { minuteAtDrop, type AgendaItem } from '@/entities/calendar-event'
import type { DragHandlers } from '@/widgets/calendar'

const EMPTY_FRAME = { x: 0, y: 0, width: 0, height: 0 }
export function useCalendarDrag(
    hourHeight: number,
    onDrop: (item: AgendaItem, minute: number) => void,
) {
    const root = useRef<View>(null)
    const viewport = useRef<View>(null)
    const scroll = useRef<ScrollView>(null)
    const frame = useRef(EMPTY_FRAME)
    const rootOrigin = useRef({ x: 0, y: 0 })
    const scrollOffset = useRef(0)
    const itemRef = useRef<AgendaItem | null>(null)
    const point = useRef({ x: 0, y: 0 })
    const [item, setItem] = useState<AgendaItem | null>(null)
    const [minute, setMinute] = useState<number | null>(null)
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const ghostStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: x.get() }, { translateY: y.get() }],
    }))
    const stop = useCallback(() => {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
    }, [])
    useEffect(() => stop, [stop])
    const measure = () => {
        root.current?.measureInWindow((rx, ry) => {
            rootOrigin.current = { x: rx, y: ry }
        })
        viewport.current?.measureInWindow((vx, vy, width, height) => {
            frame.current = { x: vx, y: vy, width, height }
        })
    }
    const update = (px: number, py: number) => {
        point.current = { x: px, y: py }
        x.set(px - rootOrigin.current.x - 104)
        y.set(py - rootOrigin.current.y - 68)
        setMinute(
            minuteAtDrop(
                px,
                py,
                frame.current,
                scrollOffset.current,
                hourHeight,
            ),
        )
    }
    const cancel = () => {
        stop()
        itemRef.current = null
        setItem(null)
        setMinute(null)
    }
    const onOffset = useCallback((offset: number) => {
        scrollOffset.current = offset
    }, [])
    const handlers: DragHandlers = {
        onStart: (next, px, py) => {
            measure()
            itemRef.current = next
            setItem(next)
            update(px, py)
            hapticSelect()
            stop()
            timer.current = setInterval(() => {
                const f = frame.current
                const p = point.current
                if (
                    !f.height ||
                    p.x < f.x + 60 ||
                    p.x > f.x + f.width ||
                    p.y < f.y ||
                    p.y > f.y + f.height
                )
                    return
                const delta =
                    p.y < f.y + 50 ? -12 : p.y > f.y + f.height - 60 ? 12 : 0
                if (!delta) return
                scrollOffset.current = Math.max(
                    0,
                    Math.min(
                        hourHeight * 24 - f.height + 14,
                        scrollOffset.current + delta,
                    ),
                )
                scroll.current?.scrollTo({
                    y: scrollOffset.current,
                    animated: false,
                })
                setMinute(
                    minuteAtDrop(p.x, p.y, f, scrollOffset.current, hourHeight),
                )
            }, 32)
        },
        onMove: update,
        onEnd: (px, py) => {
            const target = minuteAtDrop(
                px,
                py,
                frame.current,
                scrollOffset.current,
                hourHeight,
            )
            const dragged = itemRef.current
            cancel()
            if (target != null && dragged) {
                hapticSelect()
                onDrop(dragged, target)
            }
        },
        onCancel: cancel,
    }
    return {
        rootRef: root,
        viewportRef: viewport,
        scrollRef: scroll,
        onOffset,
        item,
        minute,
        ghostStyle,
        handlers,
        measure,
    }
}
