import type { SharedValue } from 'react-native-reanimated'

export type OnboardingPaginationProps = {
    count: number
    pageWidth: number
    scrollX: SharedValue<number>
}
