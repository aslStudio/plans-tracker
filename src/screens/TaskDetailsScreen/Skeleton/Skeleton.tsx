import { t, useLanguage } from '@/shared/lib/i18n'
import { ScrollView, View } from 'react-native'

import { AppHeader } from '@/shared/ui/AppHeader'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { SkeletonText } from '@/shared/ui/SkeletonText'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'

import { useStyles } from '../styles'
import { useSkeletonStyles } from './styles'

function SkeletonRow({ labelWidth }: { labelWidth: number }) {
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
 * Stands in for `TaskDetailsScreen` while its draft is still loading —
 * shares its real header and `styles.container`/`styles.content` so
 * `TransitionFade` swaps this for the real screen without a layout jump.
 * Only covers rows that are always present regardless of settings
 * (status, the two date rows) — whether groups/priority/recurrence/time
 * show at all depends on app settings that are themselves still loading,
 * so those sections just fade in afterwards rather than being guessed at.
 */
export function TaskDetailsSkeleton({ onClose }: { onClose: () => void }) {
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
                    <SkeletonRow labelWidth={110} />
                    <Separator offsetLeft={16} />
                    <SkeletonRow labelWidth={130} />
                </Section>

                <Section paddingBottom={8}>
                    <View style={skeletonStyles.paragraph}>
                        <SkeletonText width={60} />
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <SkeletonText width={120} size="title-2" />
                            <SkeletonText width={80} size="title-2" />
                        </View>
                    </View>
                </Section>
                <Section paddingBottom={8}>
                    <View style={skeletonStyles.paragraph}>
                        <SkeletonText width="100%" />
                        <SkeletonText width="92%" />
                        <SkeletonText width="68%" />
                    </View>
                </Section>
            </ScrollView>
        </View>
    )
}
