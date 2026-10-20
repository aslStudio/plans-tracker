import { View } from 'react-native'

import { IconSkeletonProps } from './model'
import { useStyles } from './styles'

export function IconSkeleton({ style, size }: IconSkeletonProps) {
    const styles = useStyles(size)

    return (
        <View
            style={[
                styles['skeleton-root'],
                {
                    width: size,
                    height: size,
                    padding: (1 / 24) * size,
                },
                style,
            ]}
        >
            <View style={styles['skeleton-circle']} />
        </View>
    )
}
