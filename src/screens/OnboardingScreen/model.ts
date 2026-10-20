export type OnboardingFeature = {
    title: string
    description: string
    animation: number
}

export type OnboardingSlideData = {
    key: string
    animation: number
    title: string
    description: string
    features: OnboardingFeature[]
}

export type OnboardingScreenProps = {
    onFinish: () => void
}
