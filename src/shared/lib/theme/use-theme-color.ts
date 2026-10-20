import type { Color } from '@/shared/config/color'
import { ColorValues } from '@/shared/config/color'
import { resolveTextColor } from '@/shared/ui/TheText/model'

import { useTheme } from './use-theme'

export function useThemeColor(color: Color | string): string {
    const theme = useTheme()
    return ColorValues.includes(color as Color)
        ? resolveTextColor(theme.colors, color as Color)
        : color
}
