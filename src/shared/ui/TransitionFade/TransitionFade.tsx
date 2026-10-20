import Animated from 'react-native-reanimated'

import { listEnter, listExit } from '@/shared/lib/motion'

import type { TransitionFadeProps } from './model'

/**
 * Cross-fades between a skeleton and its real content on a single `loading`
 * flip. The two branches carry distinct `key`s so React unmounts the
 * outgoing one and mounts the incoming one instead of reusing the same
 * `Animated.View` instance — that's what lets `entering`/`exiting` actually
 * fire, the same mechanism `shared/lib/motion`'s `listEnter`/`listExit`
 * already drive for list add/remove elsewhere in the app.
 */
export function TransitionFade({
    loading,
    skeleton,
    children,
    style,
}: TransitionFadeProps) {
    return loading ? (
        <Animated.View
            key="skeleton"
            entering={listEnter}
            exiting={listExit}
            style={style}
        >
            {skeleton}
        </Animated.View>
    ) : (
        <Animated.View
            key="content"
            entering={listEnter}
            exiting={listExit}
            style={style}
        >
            {children}
        </Animated.View>
    )
}
