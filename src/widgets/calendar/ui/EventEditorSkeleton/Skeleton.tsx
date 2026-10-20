import { t, useLanguage } from '@/shared/lib/i18n'
import { ScrollView, View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { AppHeader } from '@/shared/ui/AppHeader'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { Skeleton as SkeletonBlock } from '@/shared/ui/Skeleton'
import { SkeletonText } from '@/shared/ui/SkeletonText'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'

import { useSkeletonStyles } from './styles'

function SkeletonRow({ hasIcon = true }: { hasIcon?: boolean }) {
    const styles = useSkeletonStyles()

    return (
        <View style={styles.row}>
            {hasIcon && (
                <SkeletonBlock style={styles.rowIcon} borderRadius={10} />
            )}
            <View style={styles.rowTexts}>
                <SkeletonText width="45%" />
                <SkeletonText size="subheadline" width="65%" />
            </View>
        </View>
    )
}

/**
 * Stands in for `EventEditor` while `plan/[id]`'s own data (tasks, habits,
 * the stored event) is still loading. Unlike the habit/task detail
 * skeletons, nothing about the form's content loads incrementally here —
 * the route gates on a single `loading` flag — so this only needs to echo
 * the editor's general shape, not track which optional sections it'll end
 * up showing. `isNew` is known synchronously from the route param, so the
 * header title doesn't need to be skeletoned.
 */
export function EventEditorSkeleton({
    isNew,
    onClose,
}: {
    isNew: boolean
    onClose: () => void
}) {
    useLanguage()

    const styles = useSkeletonStyles()
    const { colors } = useTheme()

    return (
        <View
            style={[
                styles.root,
                { backgroundColor: colors.background.primary },
            ]}
        >
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={
                    <TheText size="body" weight="600" color="labels-primary">
                        {isNew ? t('Новый план') : t('План')}
                    </TheText>
                }
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
                <View style={styles.title}>
                    <SkeletonText size="title-1" width="70%" />
                </View>

                <View style={styles.palette}>
                    {Array.from({ length: 6 }, (_, index) => (
                        <SkeletonBlock
                            key={index}
                            style={styles.swatch}
                            borderRadius={17}
                        />
                    ))}
                </View>

                <Section paddingBottom={8}>
                    <SkeletonRow hasIcon={false} />
                    <Separator offsetLeft={16} />
                    <SkeletonRow />
                </Section>

                <Section paddingBottom={8}>
                    <View style={{ padding: 16, gap: 12 }}>
                        <SkeletonText width="40%" />
                        <SkeletonText width="90%" />
                        <SkeletonText width="65%" />
                    </View>
                </Section>

                <Section paddingBottom={8}>
                    <SkeletonRow hasIcon={false} />
                    <Separator offsetLeft={16} />
                    <SkeletonRow hasIcon={false} />
                </Section>
            </ScrollView>
        </View>
    )
}
