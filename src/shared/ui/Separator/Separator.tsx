import React from 'react'
import { View } from 'react-native'

import { type SeparatorProps } from './model'
import { useStyles } from './styles'

export const Separator: React.FC<SeparatorProps> = ({
    style,
    offsetLeft,
    offsetRight = 16,
}) => {
    const styles = useStyles()

    return (
        <View
            style={{
                paddingLeft: offsetLeft,
                paddingRight: offsetRight,
            }}
        >
            <View style={[styles.root, style]} />
        </View>
    )
}
