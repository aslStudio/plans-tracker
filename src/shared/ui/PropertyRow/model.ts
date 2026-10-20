import type { Color } from '@/shared/config/color'
import type { NativeMenuItem } from '@/shared/ui/NativeMenu'

export type PropertyRowProps = {
    label: string
    valueLabel: string
    valueColor?: Color
    items: NativeMenuItem[]
}
