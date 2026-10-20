import { t, useLanguage } from '@/shared/lib/i18n'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react'
import {
    ScrollView,
    View,
    StyleSheet,
    type ScrollViewProps,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { hapticSelect } from '@/shared/lib/haptics'
import { TheText } from '@/shared/ui/TheText'

export type DragItem = { id: string; title: string; from: string }
type Rect = { x: number; y: number; width: number; height: number }
type Context = {
    item: DragItem | null
    target: string | null
    register: (id: string, view: View | null) => void
    start: (item: DragItem, x: number, y: number) => void
    move: (x: number, y: number) => void
    end: (x: number, y: number) => void
    cancel: () => void
}
const DragContext = createContext<Context | null>(null)

/** Long-hold drag with window-space drop targets and edge autoscroll. */
export function DragDropList({
    children,
    onDrop,
    scrollRef: externalRef,
    ...props
}: ScrollViewProps & {
    children: ReactNode
    onDrop: (item: DragItem, target: string) => void
    scrollRef?: RefObject<ScrollView | null>
}) {
    const language = useLanguage()

    const internalRef = useRef<ScrollView>(null)
    const scrollRef = externalRef ?? internalRef
    const root = useRef<View>(null)
    const views = useRef(new Map<string, View>())
    const frames = useRef(new Map<string, Rect>())
    const viewport = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 })
    const offset = useRef(0)
    const contentHeight = useRef(0)
    const active = useRef<DragItem | null>(null)
    const point = useRef({ x: 0, y: 0 })
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)
    const [item, setItem] = useState<DragItem | null>(null)
    const [target, setTarget] = useState<string | null>(null)
    const { colors } = useTheme()
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const ghostStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: x.get() }, { translateY: y.get() }],
    }))
    const stop = () => {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
    }
    useEffect(
        () => () => {
            if (timer.current) clearInterval(timer.current)
        },
        [],
    )
    function measure() {
        root.current?.measureInWindow((rx, ry, width, height) => {
            viewport.current = { x: rx, y: ry, width, height }
        })
        views.current.forEach((view, id) =>
            view.measureInWindow((rx, ry, width, height) => {
                frames.current.set(id, { x: rx, y: ry, width, height })
            }),
        )
    }
    function targetAt(px: number, py: number) {
        const f = viewport.current
        if (px < f.x || px > f.x + f.width || py < f.y || py > f.y + f.height)
            return null
        return (
            [...frames.current].find(
                ([, r]) =>
                    px >= r.x &&
                    px <= r.x + r.width &&
                    py >= r.y &&
                    py <= r.y + r.height,
            )?.[0] ?? null
        )
    }
    function move(px: number, py: number) {
        point.current = { x: px, y: py }
        x.set(
            Math.max(
                8,
                Math.min(
                    viewport.current.width - 248,
                    px - viewport.current.x - 120,
                ),
            ),
        )
        y.set(py - viewport.current.y - 48)
        setTarget(targetAt(px, py))
    }
    function cancel() {
        stop()
        active.current = null
        setItem(null)
        setTarget(null)
    }
    const register = useCallback(
        (id: string, view: View | null) => {
            // Recompute localized values when the app language changes.
            void language

            if (view) views.current.set(id, view)
            else {
                views.current.delete(id)
                frames.current.delete(id)
            }
        },
        [language],
    )
    const context: Context = {
        item,
        target,
        register,
        start(next, px, py) {
            stop()
            measure()
            active.current = next
            setItem(next)
            move(px, py)
            hapticSelect()
            timer.current = setInterval(() => {
                const f = viewport.current
                const p = point.current
                if (
                    p.x < f.x ||
                    p.x > f.x + f.width ||
                    p.y < f.y ||
                    p.y > f.y + f.height
                )
                    return
                const delta =
                    p.y < f.y + 64 ? -14 : p.y > f.y + f.height - 64 ? 14 : 0
                if (!delta) return
                const nextOffset = Math.max(
                    0,
                    Math.min(
                        Math.max(0, contentHeight.current - f.height),
                        offset.current + delta,
                    ),
                )
                const change = nextOffset - offset.current
                offset.current = nextOffset
                frames.current.forEach((r, id) =>
                    frames.current.set(id, { ...r, y: r.y - change }),
                )
                scrollRef.current?.scrollTo({ y: nextOffset, animated: false })
                setTarget(targetAt(p.x, p.y))
            }, 32)
        },
        move,
        end(px, py) {
            const next = targetAt(px, py)
            const dragged = active.current
            cancel()
            if (next && dragged && next !== dragged.from) {
                hapticSelect()
                onDrop(dragged, next)
            }
        },
        cancel,
    }
    return (
        <DragContext.Provider value={context}>
            <View
                ref={root}
                testID="drag-drop-viewport"
                collapsable={false}
                style={styles.root}
                onLayout={measure}
            >
                <ScrollView
                    {...props}
                    ref={scrollRef}
                    scrollEnabled={!item && props.scrollEnabled !== false}
                    scrollEventThrottle={16}
                    onScroll={(event) => {
                        offset.current = event.nativeEvent.contentOffset.y
                        props.onScroll?.(event)
                    }}
                    onContentSizeChange={(w, h) => {
                        contentHeight.current = h
                        measure()
                        props.onContentSizeChange?.(w, h)
                    }}
                >
                    {children}
                </ScrollView>
                {item && (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.ghost,
                            {
                                backgroundColor: colors.background.elevated,
                            },
                            ghostStyle,
                        ]}
                    >
                        <TheText weight="600" numberOfLines={2}>
                            {item.title}
                        </TheText>
                        <TheText size="caption-1" color="labels-secondary">
                            {target && target !== item.from
                                ? t('Отпустите, чтобы перенести')
                                : t('Перетащите в нужную секцию')}
                        </TheText>
                    </Animated.View>
                )}
            </View>
        </DragContext.Provider>
    )
}

export function DropZone({
    id,
    children,
    disabled = false,
}: {
    id: string
    children: ReactNode
    disabled?: boolean
}) {
    const context = useContext(DragContext)
    const { colors } = useTheme()
    const register = context?.register
    const registerRef = useCallback(
        (view: View | null) => {
            if (!disabled) register?.(id, view)
        },
        [register, id, disabled],
    )
    const highlighted =
        context?.item && context.target === id && context.item.from !== id
    return (
        <View
            ref={registerRef}
            collapsable={false}
            style={
                highlighted
                    ? {
                          backgroundColor: colors.brandSecondary,
                          borderRadius: 20,
                      }
                    : undefined
            }
            testID={`drop-zone-${id}`}
        >
            {children}
        </View>
    )
}

export function DragSource({
    item,
    disabled = false,
    children,
}: {
    item: DragItem
    disabled?: boolean
    children: ReactNode
}) {
    const context = useContext(DragContext)
    const gesture = Gesture.Pan()
        .enabled(!!context && !disabled)
        .activateAfterLongPress(350)
        .runOnJS(true)
        .withTestId(`drag-${item.from}-${item.id}`)
        .onStart((e) => context?.start(item, e.absoluteX, e.absoluteY))
        .onUpdate((e) => context?.move(e.absoluteX, e.absoluteY))
        .onEnd((e, success) => {
            if (success) context?.end(e.absoluteX, e.absoluteY)
            else context?.cancel()
        })
        .onFinalize((_e, success) => {
            if (!success) context?.cancel()
        })
    return (
        <GestureDetector gesture={gesture}>
            <View
                collapsable={false}
                style={{
                    opacity:
                        context?.item?.id === item.id &&
                        context.item.from === item.from
                            ? 0.35
                            : 1,
                }}
            >
                {children}
            </View>
        </GestureDetector>
    )
}
const styles = StyleSheet.create({
    root: { flex: 1 },
    ghost: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 240,
        padding: 14,
        gap: 6,
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
    },
})
