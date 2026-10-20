import React from 'react'
import type { CardVariant } from '@/shared/ui/Card'

export type SectionProps = React.PropsWithChildren<{
    animated?: boolean
    paddingTop?: number
    paddingHorizontal?: number
    paddingBottom?: number

    withCard?: boolean
    cardVariant?: CardVariant

    TopElement?: React.ReactNode
    BottomElement?: React.ReactNode
}>
