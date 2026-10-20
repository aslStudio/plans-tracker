import type { ReactElement } from 'react'
import type { SFSymbol } from 'sf-symbols-typescript'

import type { MonoIconName } from '@/shared/config/icons'

export type NativeMenuItem = {
    key: string
    label: string
    /** SF Symbol name — shown on iOS only while this item `isActive` (an inactive row stays plain). */
    systemImage?: SFSymbol
    /** Our own icon — the Android/web fallback's equivalent, same active-only visibility. */
    icon?: MonoIconName
    /** Rotates the fallback icon 180° — used for the descending-direction arrow. */
    iconFlipped?: boolean
    isActive: boolean
    onPress: () => void
}

export type NativeMenuProps = {
    /** The decorative trigger (e.g. a `TheButtonIcon` with a no-op `onPress` — this wrapper owns the actual open gesture). Must be a single element — iOS hosts it natively via `RNHostView`, which requires exactly that. */
    trigger: ReactElement
    items: NativeMenuItem[]
}
