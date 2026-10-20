import { TransitionFade } from '@/shared/ui/TransitionFade'

import type { SkeletonWrapperProps } from './model'

/** The screen-level loading gate: shows `skeleton` while `isLoading`, cross-fading into `children` once real data has arrived. Defaults `style` to fill its parent, since it usually stands in for a whole screen's root view. */
export function SkeletonWrapper({
    isLoading,
    skeleton,
    children,
    style = { flex: 1 },
}: SkeletonWrapperProps) {
    return (
        <TransitionFade loading={isLoading} skeleton={skeleton} style={style}>
            {children}
        </TransitionFade>
    )
}
