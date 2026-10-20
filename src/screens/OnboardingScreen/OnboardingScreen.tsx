import { t, useLanguage } from '@/shared/lib/i18n'
import { useRef, useState } from 'react'
import {
    Pressable,
    ScrollView,
    View,
    useWindowDimensions,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native'
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated'

import { hapticTap } from '@/shared/lib/haptics'
import { TheButton } from '@/shared/ui/TheButton'
import { TheText } from '@/shared/ui/TheText'

import { ONBOARDING_SLIDES } from './data'
import type { OnboardingScreenProps } from './model'
import { useStyles } from './styles'
import { OnboardingPagination } from './ui/OnboardingPagination'
import { OnboardingSlide } from './ui/OnboardingSlide'

/** A one-time, swipeable walkthrough of the app's main sections — shown before the first launch's real navigation mounts, see `app/_layout.tsx`. */
export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
    useLanguage()

    const styles = useStyles()
    const { width } = useWindowDimensions()
    const scrollRef = useRef<ScrollView>(null)
    const scrollX = useSharedValue(0)
    const [activeIndex, setActiveIndex] = useState(0)
    const isLast = activeIndex === ONBOARDING_SLIDES.length - 1

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.set(event.contentOffset.x)
        },
    })

    function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const raw = Math.round(event.nativeEvent.contentOffset.x / width)
        const index = Math.max(0, Math.min(ONBOARDING_SLIDES.length - 1, raw))
        setActiveIndex(index)
    }

    function goNext() {
        hapticTap()
        if (isLast) {
            onFinish()
            return
        }
        scrollRef.current?.scrollTo({
            x: width * (activeIndex + 1),
            animated: true,
        })
    }

    function skip() {
        hapticTap()
        onFinish()
    }

    return (
        <View style={styles.root}>
            {!isLast && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Пропустить')}
                    onPress={skip}
                    style={styles.skip}
                >
                    <TheText
                        size="subheadline"
                        weight="600"
                        color="labels-secondary"
                    >
                        {t('Пропустить')}
                    </TheText>
                </Pressable>
            )}
            <Animated.ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleScrollEnd}
                style={styles.pager}
                contentContainerStyle={styles.pagerContent}
            >
                {ONBOARDING_SLIDES.map((slide) => (
                    <OnboardingSlide
                        key={slide.key}
                        slide={slide}
                        width={width}
                    />
                ))}
            </Animated.ScrollView>
            <View style={styles.footer}>
                <OnboardingPagination
                    count={ONBOARDING_SLIDES.length}
                    pageWidth={width}
                    scrollX={scrollX}
                />
                <TheButton
                    size="52"
                    variant="primary"
                    view="brand"
                    isWide
                    onPress={goNext}
                >
                    {isLast ? t('Начать') : t('Далее')}
                </TheButton>
            </View>
        </View>
    )
}
