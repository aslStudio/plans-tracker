import { View } from 'react-native'

import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'

import { OnboardingFeatureItem } from '../OnboardingFeatureItem'
import type { OnboardingSlideProps } from './model'
import { useStyles } from './styles'

/** One page of the onboarding pager — a header animation/title/description followed by this topic's perk list. */
export function OnboardingSlide({ slide, width }: OnboardingSlideProps) {
    const styles = useStyles()

    return (
        <View style={[styles.root, { width }]}>
            <View style={styles.animationWrap}>
                <TheLottie
                    source={slide.animation}
                    style={styles.animation}
                    accessibilityLabel={slide.title}
                />
            </View>
            <View style={styles.texts}>
                <TheText size="title-1" weight="700" style={styles.title}>
                    {slide.title}
                </TheText>
                <TheText
                    size="body"
                    color="labels-secondary"
                    style={styles.description}
                >
                    {slide.description}
                </TheText>
            </View>
            <View style={styles.features}>
                {slide.features.map((feature) => (
                    <OnboardingFeatureItem key={feature.title} {...feature} />
                ))}
            </View>
        </View>
    )
}
