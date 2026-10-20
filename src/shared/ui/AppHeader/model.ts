import type { ReactNode } from 'react'

export type AppHeaderProps = {
    LeftItem?: ReactNode
    CenterItem?: ReactNode
    RightItem?: ReactNode
    /** A modal-presented screen uses a small fixed top gap instead of the real safe-area inset. */
    isModal?: boolean
    withBlur?: boolean
}
