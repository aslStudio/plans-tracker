import React, { useId } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import { useTheme } from '@/shared/lib/theme/use-theme'

/**
 * The soft brand-tinted wash behind a screen's scroll content — transparent
 * at the very bottom, fading up through a soft glow that peaks around a
 * third of the way down from the top, fading back to transparent at the
 * very top. A single `washColor` at varying `stopOpacity` keyed to the live
 * theme/accent color, so changing the accent recolors the wash automatically
 * instead of it staying a hardcoded hex.
 *
 * Fixed to the viewport (render it as a sibling *before* the scrollable
 * content, inside a `flex: 1` container whose own background already
 * carries the page's real background color) so it doesn't scroll away
 * with the page.
 *
 * `useId()` keeps the gradient's `<Defs>` id unique per screen instance —
 * more than one of these can be mounted at once (e.g. two stacked routes),
 * and SVG ids are global to the document/surface, not scoped per `<Svg>`.
 *
 * Every screen deliberately uses the same live brand color. Feature-specific
 * accent colors belong to their cards and illustrations, not the page wash.
 */
export function ScreenGradientBackground() {
    const { colors } = useTheme()
    const gradientId = `screenGradientBackground-${useId()}`
    const washColor = colors.brand

    return (
        <Svg
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            width="100%"
            height="100%"
        >
            <Defs>
                <LinearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
                    <Stop offset="0" stopColor={washColor} stopOpacity={0} />
                    <Stop
                        offset="0.36"
                        stopColor={washColor}
                        stopOpacity={0.15}
                    />
                    <Stop
                        offset="0.65"
                        stopColor={washColor}
                        stopOpacity={0.22}
                    />
                    <Stop
                        offset="0.89"
                        stopColor={washColor}
                        stopOpacity={0.15}
                    />
                    <Stop offset="1" stopColor={washColor} stopOpacity={0} />
                </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>
    )
}
