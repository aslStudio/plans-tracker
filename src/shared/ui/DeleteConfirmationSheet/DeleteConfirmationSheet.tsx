import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { StyleSheet, View } from 'react-native'

import { Placeholder } from '@/shared/ui/Placeholder'
import { TheButton } from '@/shared/ui/TheButton'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheBottomSheet } from '@/shared/ui/TheBottomSheet'

export type DeleteConfirmationSheetProps = {
    title?: string
    description?: string
    confirmLabel?: string
    visible: boolean
    onCancel: () => void
    onConfirm: () => void
}

/** A shared, explicit confirmation step for irreversible deletion actions. */
export function DeleteConfirmationSheet({
    title = t('Удалить без возможности восстановления?'),
    description = t('Все данные будут удалены. Это действие нельзя отменить.'),
    confirmLabel = t('Удалить'),
    visible,
    onCancel,
    onConfirm,
}: DeleteConfirmationSheetProps) {
    useLanguage()

    return (
        <TheBottomSheet visible={visible} onClose={onCancel}>
            {(dismiss) => (
                <>
                    <Placeholder
                        title={title}
                        description={description}
                        style={styles.placeholder}
                    >
                        <TheLottie
                            source={lottie.delete}
                            style={styles.animation}
                            accessibilityLabel={t('Анимация удаления')}
                        />
                    </Placeholder>
                    <View style={styles.actions}>
                        <TheButton
                            size="52"
                            variant="secondary"
                            view="neutral"
                            isFlex
                            onPress={() => dismiss(onCancel)}
                        >
                            {t('Отмена')}
                        </TheButton>
                        <TheButton
                            size="52"
                            variant="primary"
                            view="destructive"
                            isFlex
                            onPress={() => dismiss(onConfirm)}
                        >
                            {confirmLabel}
                        </TheButton>
                    </View>
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
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
})
