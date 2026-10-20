import React from 'react'
import { View } from 'react-native'

import { type RowIconBubbleProps } from './model'
import { useBubbleStyles } from './styles'

/** Filled circle behind a `Row`'s left `icon` — the small colored badge used throughout Settings. */
export const RowIconBubble: React.FC<RowIconBubbleProps> = ({
    icon,
    backgroundColor = 'brand',
    size = 36,
    shape = 'circle',
}) => {
    const styles = useBubbleStyles(size, backgroundColor, shape)

    return <View style={styles.root}>{icon}</View>
}
