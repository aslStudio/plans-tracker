import { t } from '@/shared/lib/i18n'
import { useRef, useState } from 'react'
import { TextInput } from 'react-native'
import Animated, {
    cancelAnimation,
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { showAppToast } from '@/shared/lib/toast/app-toast'

export const RequiredTitleInput = Animated.createAnimatedComponent(TextInput)

export function useRequiredTitle(title: string, description: string) {
    const { colors } = useTheme()
    const inputRef = useRef<TextInput>(null)
    const [attempted, setAttempted] = useState(false)
    const offset = useSharedValue(0)
    const invalid = attempted && !title.trim()
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: offset.get() }],
    }))

    function validate() {
        if (title.trim()) return true
        setAttempted(true)
        cancelAnimation(offset)
        offset.set(0)
        offset.set(
            withSequence(
                ReduceMotion.System,
                withTiming(-5, { duration: 45 }),
                withTiming(5, { duration: 65 }),
                withTiming(-3, { duration: 65 }),
                withTiming(3, { duration: 65 }),
                withTiming(0, { duration: 60 }),
            ),
        )
        inputRef.current?.focus()
        showAppToast({
            title: t('Нужно ввести название'),
            description,
            animation: 'warning',
        })
        return false
    }

    return {
        inputRef,
        validate,
        animatedStyle,
        placeholderColor: invalid ? colors.accent.red : colors.labels.tertiary,
    }
}
