import { t, useLanguage } from '@/shared/lib/i18n'
import { StyleSheet } from 'react-native'

import { TheButton } from '@/shared/ui/TheButton'
import { TheLottie } from '@/shared/ui/TheLottie'
import { Placeholder } from '@/shared/ui/Placeholder'
import { TheBottomSheet } from '@/shared/ui/TheBottomSheet'

export type ExplanationBottomSheetProps = {
    visible: boolean
    title: string
    description: string
    animation: number
    onClose: () => void
}

export function ExplanationBottomSheet({
    visible,
    title,
    description,
    animation,
    onClose,
}: ExplanationBottomSheetProps) {
    useLanguage()

    return (
        <TheBottomSheet visible={visible} onClose={onClose}>
            {(dismiss) => (
                <>
                    <Placeholder
                        title={title}
                        description={description}
                        style={styles.placeholder}
                    >
                        <TheLottie
                            source={animation}
                            style={styles.animation}
                            accessibilityLabel={title}
                        />
                    </Placeholder>
                    <TheButton
                        size="52"
                        variant="primary"
                        view="brand"
                        isWide
                        onPress={() => dismiss(onClose)}
                    >
                        {t('Понятно')}
                    </TheButton>
                </>
            )}
        </TheBottomSheet>
    )
}

const styles = StyleSheet.create({
    placeholder: {
        paddingHorizontal: 4,
    },
    animation: {
        width: 96,
        height: 96,
    },
})
