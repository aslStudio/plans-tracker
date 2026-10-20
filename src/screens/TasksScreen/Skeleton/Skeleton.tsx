import React from 'react'
import { View } from 'react-native'

import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { Skeleton as SkeletonBlock } from '@/shared/ui/Skeleton'

import { useStyles } from './styles'

// Varied so rows don't read as one flat repeated block — mirrors real
// titles/descriptions differing in length.
const TITLE_WIDTHS = [180, 140, 160]

function SkeletonRow({
    titleWidth,
    hasDescription = true,
}: {
    titleWidth: number
    hasDescription?: boolean
}) {
    const styles = useStyles()

    return (
        <View style={styles.row}>
            <SkeletonBlock style={styles.radio} borderRadius={12} />
            <View style={styles.rowTexts}>
                <SkeletonBlock
                    style={[styles.titleLine, { width: titleWidth }]}
                    borderRadius={6}
                />
                {hasDescription && (
                    <SkeletonBlock
                        style={styles.descriptionLine}
                        borderRadius={6}
                    />
                )}
            </View>
        </View>
    )
}

export const Skeleton: React.FC = () => {
    const styles = useStyles()

    return (
        <View>
            <View style={styles.sectionTitle}>
                <SkeletonBlock
                    style={styles.sectionTitleText}
                    borderRadius={6}
                />
            </View>
            <Section>
                <SkeletonRow titleWidth={TITLE_WIDTHS[0]} />
                <Separator offsetLeft={16} />
                <SkeletonRow
                    titleWidth={TITLE_WIDTHS[1]}
                    hasDescription={false}
                />
            </Section>

            <View style={styles.sectionTitle}>
                <SkeletonBlock
                    style={styles.sectionTitleText}
                    borderRadius={6}
                />
            </View>
            <Section>
                <SkeletonRow titleWidth={TITLE_WIDTHS[2]} />
            </Section>
        </View>
    )
}
