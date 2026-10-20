import React from 'react'
import { View } from 'react-native'

import { TheText } from '@/shared/ui/TheText'

import { type PlaceholderProps, sizeMap } from './model'
import { useStyles } from './styles'

export const Placeholder: React.FC<PlaceholderProps> = ({
    size = 'default',
    title,
    description,
    children,
    style,
}) => {
    const styles = useStyles(size)

    return (
        <View style={[styles.root, style]}>
            {children}
            <TheText {...sizeMap[size].title}>{title}</TheText>
            {description && (
                <TheText {...sizeMap[size].description}>{description}</TheText>
            )}
        </View>
    )
}
