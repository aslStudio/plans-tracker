import type { MonoIconName } from '@/shared/config/icons'

export type TheButtonIconProps = {
    icon: MonoIconName
    variant?: 'primary' | 'secondary' | 'plain'
    view?: 'brand' | 'destructive' | 'neutral' | 'overlay' | 'grouped'
    size?: '52' | '44' | '40' | '36' | '28' | '22'
    isLoading?: boolean
    isDisabled?: boolean
    disabledAppearance?: 'muted' | 'opacity'
    isLiquidGlass?: boolean
    isWide?: boolean
    accessibilityLabel?: string
    onPress: () => void
    onPressIn?: () => void
    onPressOut?: () => void
}

export const heightMap = {
    '52': 52,
    '44': 44,
    '40': 40,
    '36': 36,
    '28': 28,
    '22': 22,
} as const
export const iconSizeMap = {
    '52': 28,
    '44': 25,
    '40': 24,
    '36': 20,
    '28': 20,
    '22': 16,
} as const
