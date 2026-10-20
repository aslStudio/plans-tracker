import { t, useLanguage } from '@/shared/lib/i18n'
import { ScrollView, View } from 'react-native'

import { AppHeader } from '@/shared/ui/AppHeader'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { Skeleton as SkeletonBlock } from '@/shared/ui/Skeleton'
import { SkeletonText } from '@/shared/ui/SkeletonText'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'

import { useStyles } from '../styles'
import { useSkeletonStyles } from './styles'

function SkeletonPropertyRow({ labelWidth }: { labelWidth: number }) {
    const styles = useSkeletonStyles()

    return (
        <View style={styles.row}>
            <SkeletonText width={labelWidth} />
            <View style={styles.rowSpacer} />
            <SkeletonText width={64} />
        </View>
    )
}

/**
 * Stands in for `HabitDetailScreen` while its draft is still loading —
 * shares its real header and `styles.container`/`styles.content` so there's
 * no layout jump when `TransitionFade` swaps this for the real screen.
 * `isNew` is known synchronously from the route param, so the rows that
 * only exist for an already-saved habit (status, month progress) can be
 * included or skipped up front rather than guessed at.
 */
export function HabitDetailSkeleton({
    isNew,
    onClose,
}: {
    isNew: boolean
    onClose: () => void
}) {
    useLanguage()

    const styles = useStyles()
    const skeletonStyles = useSkeletonStyles()

    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        view="grouped"
                        accessibilityLabel={t('Закрыть')}
                        onPress={onClose}
                    />
                }
            />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={skeletonStyles.title}>
                    <SkeletonText size="title-1" width="65%" />
                </View>

                <Section paddingBottom={8}>
                    {!isNew && (
                        <>
                            <SkeletonPropertyRow labelWidth={70} />
                            <Separator offsetLeft={16} />
                        </>
                    )}
                    <SkeletonPropertyRow labelWidth={70} />
                </Section>

                <Section paddingBottom={8}>
                    <View style={skeletonStyles.paragraph}>
                        <SkeletonText width="100%" />
                        <SkeletonText width="92%" />
                        <SkeletonText width="68%" />
                    </View>
                </Section>

                {!isNew && (
                    <Section paddingBottom={8}>
                        <View style={skeletonStyles.progress}>
                            <View style={skeletonStyles.progressHeader}>
                                <SkeletonText width={120} />
                            </View>
                            <View style={skeletonStyles.grid}>
                                {Array.from({ length: 28 }, (_, index) => (
                                    <SkeletonBlock
                                        key={index}
                                        style={skeletonStyles.cell}
                                        borderRadius={15}
                                    />
                                ))}
                            </View>
                        </View>
                    </Section>
                )}
            </ScrollView>
        </View>
    )
}
