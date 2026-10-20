import { Skeleton } from '@/shared/ui/Skeleton'
import { TextSizeTokens } from '@/shared/ui/TheText'

import type { SkeletonTextProps } from './model'

/** A single pulsing bar standing in for one line of `TheText` — height comes off the same `TextSizeTokens` scale `TheText` itself uses, so a skeleton line roughly tracks the real line it replaces. */
export function SkeletonText({
    size = 'body',
    width = '70%',
    style,
}: SkeletonTextProps) {
    const height = Math.round(TextSizeTokens[size].fontSize * 0.62)
    return (
        <Skeleton
            style={[{ width, height }, style]}
            borderRadius={height / 2}
        />
    )
}
