import React from 'react'
import Animated from 'react-native-reanimated'
import { listLayout, listEnter, listExit } from '@/shared/lib/motion'
import { Card } from '@/shared/ui/Card'

import { type SectionProps } from './model'

export const Section: React.FC<SectionProps> = ({
    animated = false,
    paddingTop = 8,
    paddingHorizontal = 16,
    paddingBottom = 16,
    withCard = true,
    cardVariant = 'secondary',
    children,
    TopElement,
    BottomElement,
}) => {
    return (
        <Animated.View
            layout={animated ? listLayout : undefined}
            entering={animated ? listEnter : undefined}
            exiting={animated ? listExit : undefined}
            style={{
                paddingTop,
                paddingHorizontal,
                paddingBottom,
            }}
        >
            {TopElement}
            {withCard && (
                <Card variant={cardVariant} animated={animated}>
                    {children}
                </Card>
            )}
            {!withCard && children}
            {BottomElement}
        </Animated.View>
    )
}
