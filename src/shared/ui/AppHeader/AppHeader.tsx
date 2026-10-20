import MaskedView from '@react-native-masked-view/masked-view'
import { BlurView } from 'expo-blur'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { type AppHeaderProps } from './model'
import {
    APP_HEADER_ROW_HEIGHT,
    MODAL_APP_HEADER_TOP_PADDING,
    useStyles,
} from './styles'

/**
 * A fixed header that floats *over* the screen's scrollable content (ported
 * from plans-tracker's `Toolbar`) — the blur isn't scroll-triggered,
 * it's always on; the effect comes from the header sitting above the
 * content in its own stacking context while the content scrolls underneath
 * it, so you see it through the blur. A linear-gradient mask fades the blur
 * out over the row itself instead of cutting off hard at its bottom edge,
 * matching a native iOS toolbar's progressive blur.
 */
export function AppHeader({
    LeftItem,
    CenterItem,
    RightItem,
    isModal,
    withBlur = true,
}: AppHeaderProps) {
    const styles = useStyles(isModal)
    const { colorScheme } = useTheme()
    const insets = useSafeAreaInsets()

    const topInset = isModal ? MODAL_APP_HEADER_TOP_PADDING : insets.top
    const totalHeight = topInset + APP_HEADER_ROW_HEIGHT
    const fadeStart = topInset / totalHeight

    return (
        <View style={styles.root}>
            <MaskedView
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                maskElement={
                    <Svg width="100%" height="100%">
                        <Defs>
                            <LinearGradient
                                id="appHeaderBlurMask"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2={totalHeight}
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop
                                    offset={0}
                                    stopColor="#fff"
                                    stopOpacity={1}
                                />
                                <Stop
                                    offset={fadeStart}
                                    stopColor="#fff"
                                    stopOpacity={1}
                                />
                                <Stop
                                    offset={1}
                                    stopColor="#fff"
                                    stopOpacity={0}
                                />
                            </LinearGradient>
                        </Defs>
                        <Rect
                            width="100%"
                            height="100%"
                            fill="url(#appHeaderBlurMask)"
                        />
                    </Svg>
                }
            >
                {withBlur && (
                    <BlurView
                        intensity={60}
                        tint={colorScheme}
                        blurMethod="dimezisBlurViewSdk31Plus"
                        style={StyleSheet.absoluteFill}
                    />
                )}
            </MaskedView>
            <View style={styles.row}>
                <View style={styles.leftSlot}>{LeftItem}</View>
                <View style={styles.centerSlot}>{CenterItem}</View>
                <View style={styles.rightSlot}>{RightItem}</View>
            </View>
        </View>
    )
}
