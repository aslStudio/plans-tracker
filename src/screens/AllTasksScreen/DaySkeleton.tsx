import { memo } from 'react'
import { View } from 'react-native'
import { Section } from '@/shared/ui/Section'
import { SkeletonText } from '@/shared/ui/SkeletonText'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Separator } from '@/shared/ui/Separator'

export const DaySkeleton = memo(function DaySkeleton() {
    return (
        <View testID="agenda-day-skeleton">
            <Section
                TopElement={
                    <View style={{ paddingVertical: 12 }}>
                        <SkeletonText width={110} />
                    </View>
                }
            >
                {[180, 130].map((width, index) => (
                    <View key={width}>
                        {index > 0 && <Separator offsetLeft={16} />}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                padding: 16,
                            }}
                        >
                            <Skeleton
                                style={{ width: 24, height: 24 }}
                                borderRadius={12}
                            />
                            <View style={{ gap: 8 }}>
                                <SkeletonText width={width} />
                                <SkeletonText width={100} size="caption-1" />
                            </View>
                        </View>
                    </View>
                ))}
            </Section>
        </View>
    )
})
