import React from 'react'
import { View } from 'react-native'

import { TheText } from '@/shared/ui/TheText'

import { type BadgeProps, textColorMap } from './model'
import { useStyles } from './styles'

export const Badge: React.FC<BadgeProps> = ({ view, children }) => {
    const styles = useStyles(view)

    return (
        <View style={styles.root}>
            <TheText
                size={'caption-2'}
                weight={'600'}
                color={textColorMap[view]}
            >
                {children}
            </TheText>
        </View>
    )
}
