import { StyleSheet } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'

import { type BadgeProps } from './model'

export const useStyles = (view: NonNullable<BadgeProps['view']>) => {
    const { colors } = useTheme()

    const backgroundColorMap: Record<
        NonNullable<BadgeProps['view']>,
        string
    > = {
        primary: colors.brand,
        secondary: colors.brandSecondary,
        tertiary: colors.fill.tertiary,
    }

    return StyleSheet.create({
        root: {
            paddingVertical: 1.5,
            paddingHorizontal: 4,
            borderRadius: 6,
            backgroundColor: backgroundColorMap[view],
        },
    })
}
