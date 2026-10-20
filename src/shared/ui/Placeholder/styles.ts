import { StyleSheet } from 'react-native'

import { type PlaceholderProps } from './model'

export const useStyles = (size: PlaceholderProps['size']) => {
    return StyleSheet.create({
        root: {
            alignItems: 'center',
            justifyContent: 'center',

            ...(size === 'default' && {
                gap: 8,

                paddingTop: 24,
                paddingHorizontal: 60,
                paddingBottom: 16,
            }),
            ...(size === 'medium' && ({
                gap: 8,

                paddingVertical: 32,
                paddingHorizontal: 38,
            })),
            ...(size === 'large' && {
                gap: 5,

                paddingVertical: 32,
                paddingHorizontal: 38,
            }),
        },
    })
}
