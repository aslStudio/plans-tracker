import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** The row's own height below the safe area — used by screens to reserve scroll space below `AppHeader`, and by the header's own progressive blur mask to know where the row (and so the fade) ends. */
export const APP_HEADER_ROW_HEIGHT = 60
export const MODAL_APP_HEADER_TOP_PADDING = 10

/** Both side slots share this as a `minWidth` (not a cap — a wider slot's content still renders at its natural width) so a lone `CenterItem` lands on the row's true visual center, not just the midpoint between whatever Left/Right happen to contain. */
const SIDE_SLOT_MIN_WIDTH = 44

/** Total height (top inset/padding included) a screen should reserve above its scrollable content so it starts right at the header's bottom edge. */
export function getAppHeaderHeight(isModal: boolean, topInset: number): number {
    return (
        (isModal ? MODAL_APP_HEADER_TOP_PADDING : topInset) +
        APP_HEADER_ROW_HEIGHT
    )
}

export const useStyles = (isModal = false) => {
    const insets = useSafeAreaInsets()

    return StyleSheet.create({
        root: {
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 3,
            width: '100%',
            overflow: 'hidden',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: APP_HEADER_ROW_HEIGHT,
            paddingTop: isModal ? MODAL_APP_HEADER_TOP_PADDING : insets.top,
            paddingHorizontal: 16,
            paddingBottom: 10,
        },
        leftSlot: {
            minWidth: SIDE_SLOT_MIN_WIDTH,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        centerSlot: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        rightSlot: {
            minWidth: SIDE_SLOT_MIN_WIDTH,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
    })
}
