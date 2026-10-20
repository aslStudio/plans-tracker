import { useEffect, useRef, useState } from 'react'
import type {
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
} from 'react-native'

/** Reveal a selected chip after native layout or selection changes. */
export function useSelectedOptionScroll(value: string | null) {
    const ref = useRef<ScrollView>(null)
    const offset = useRef(0)
    const [width, setWidth] = useState(0)
    const [contentWidth, setContentWidth] = useState(0)
    const [layouts, setLayouts] = useState<
        Record<string, { x: number; width: number }>
    >({})
    useEffect(() => {
        const item = value === null ? undefined : layouts[value]
        if (!item || !width || !contentWidth) return
        let x = offset.current
        if (item.x < x + 16) x = item.x - 16
        else if (item.x + item.width > x + width - 16)
            x = item.x + item.width - width + 16
        x = Math.max(0, Math.min(x, contentWidth - width))
        if (x !== offset.current) {
            offset.current = x
            ref.current?.scrollTo({ x, animated: false })
        }
    }, [value, layouts, width, contentWidth])
    return {
        scrollProps: {
            ref,
            onLayout: (event: LayoutChangeEvent) =>
                setWidth(event.nativeEvent.layout.width),
            onContentSizeChange: (nextWidth: number) =>
                setContentWidth(nextWidth),
            onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                offset.current = event.nativeEvent.contentOffset.x
            },
            scrollEventThrottle: 16,
        },
        onOptionLayout: (id: string) => (event: LayoutChangeEvent) => {
            const { x, width: itemWidth } = event.nativeEvent.layout
            setLayouts((current) =>
                current[id]?.x === x && current[id]?.width === itemWidth
                    ? current
                    : { ...current, [id]: { x, width: itemWidth } },
            )
        },
    }
}
