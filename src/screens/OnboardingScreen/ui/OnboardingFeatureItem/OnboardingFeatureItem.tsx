import { View } from 'react-native'

import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'

import type { OnboardingFeatureItemProps } from './model'
import { useStyles } from './styles'

/** One "perk" row inside an onboarding slide — a small looping animation next to a title/description pair. */
export function OnboardingFeatureItem({
    title,
    description,
    animation,
}: OnboardingFeatureItemProps) {
    const styles = useStyles()

    return (
        <View style={styles.root}>
            <TheLottie
                source={animation}
                style={styles.icon}
                accessibilityLabel={title}
            />
            <View style={styles.texts}>
                <TheText size="subheadline" weight="600">
                    {title}
                </TheText>
                <TheText size="footnote" color="labels-secondary">
                    {description}
                </TheText>
            </View>
        </View>
    )
}
