import { t, useLanguage } from '@/shared/lib/i18n'
import { useRef, useState } from 'react'
import { TextInput, View, type LayoutChangeEvent } from 'react-native'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { lottie } from '@/shared/config/lottie'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { resolveTextColor, TheText } from '@/shared/ui/TheText'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheLottie } from '@/shared/ui/TheLottie'
import { Placeholder } from '@/shared/ui/Placeholder'
import { TheBottomSheet } from '@/shared/ui/TheBottomSheet'
import { AccentColorPicker } from '@/shared/ui/AccentColorPicker'
import type { AccentColor } from '@/shared/config/color'

import type { EntityEditorSheetProps } from './model'
import { useStyles } from './styles'

type Mode = 'edit' | 'delete'

/**
 * A blurred bottom sheet for naming + coloring a group or priority — reused
 * for both create and edit (`onDelete` only given while editing). The
 * caller mounts this only while editing (not keeping it around with a
 * `visible` toggle) so a fresh target's `label`/`color` just come from this
 * component's own initial render, no resync effect needed.
 *
 * Confirming a delete swaps the sheet's own content (fade out → resize →
 * fade in) rather than stacking a second `Modal` on top of this one — two
 * competing native modal-presentation animations is what looked broken.
 */
export function EntityEditorSheet({
    title,
    allowNoColor,
    initialValue,
    onClose,
    onSubmit,
    onDelete,
}: EntityEditorSheetProps) {
    const styles = useStyles()
    const [label, setLabel] = useState(initialValue.label)
    const [color, setColor] = useState(initialValue.color)
    const [mode, setMode] = useState<Mode>('edit')

    const contentOpacity = useSharedValue(1)
    const contentHeight = useSharedValue(0)
    const hasMeasuredContent = useRef(false)

    function switchMode(next: Mode) {
        contentOpacity.set(
            withTiming(0, { duration: 140 }, (finished) => {
                if (finished) runOnJS(setMode)(next)
            }),
        )
    }

    function handleContentLayout(event: LayoutChangeEvent) {
        const height = event.nativeEvent.layout.height
        if (!hasMeasuredContent.current) {
            hasMeasuredContent.current = true
            contentHeight.set(height)
            return
        }
        contentHeight.set(withTiming(height, { duration: 220 }))
        contentOpacity.set(withTiming(1, { duration: 200 }))
    }

    const contentStyle = useAnimatedStyle(() => ({
        height: contentHeight.get() || undefined,
        opacity: contentOpacity.get(),
    }))

    const canSubmit = label.trim().length > 0

    return (
        <TheBottomSheet visible onClose={onClose}>
            {(dismiss) => (
                <Animated.View style={[styles.contentClip, contentStyle]}>
                    <View onLayout={handleContentLayout}>
                        {mode === 'edit' ? (
                            <EditorContent
                                title={title}
                                allowNoColor={allowNoColor}
                                label={label}
                                onChangeLabel={setLabel}
                                color={color}
                                onChangeColor={setColor}
                                canSubmit={canSubmit}
                                hasDelete={Boolean(onDelete)}
                                onClose={() => dismiss(onClose)}
                                onRequestDelete={() => switchMode('delete')}
                                onSubmit={() =>
                                    dismiss(() =>
                                        onSubmit({
                                            label: label.trim(),
                                            color,
                                        }),
                                    )
                                }
                            />
                        ) : (
                            <DeleteConfirmContent
                                onCancel={() => switchMode('edit')}
                                onConfirm={() => dismiss(() => onDelete?.())}
                            />
                        )}
                    </View>
                </Animated.View>
            )}
        </TheBottomSheet>
    )
}

function EditorContent({
    title,
    allowNoColor,
    label,
    onChangeLabel,
    color,
    onChangeColor,
    canSubmit,
    hasDelete,
    onClose,
    onRequestDelete,
    onSubmit,
}: {
    title: string
    allowNoColor: boolean
    label: string
    onChangeLabel: (value: string) => void
    color: AccentColor | null
    onChangeColor: (value: AccentColor | null) => void
    canSubmit: boolean
    hasDelete: boolean
    onClose: () => void
    onRequestDelete: () => void
    onSubmit: () => void
}) {
    useLanguage()

    const styles = useStyles()
    const { colors } = useTheme()

    return (
        <View style={styles.editorBody}>
            <View style={styles.header}>
                <TheText size="title-3" weight="700">
                    {title}
                </TheText>
                <TheButtonIcon
                    icon="xmark"
                    size="36"
                    view="grouped"
                    accessibilityLabel={t('Закрыть')}
                    onPress={onClose}
                />
            </View>

            <View
                style={[
                    styles.inputWrap,
                    { backgroundColor: colors.background.secondary },
                ]}
            >
                <TextInput
                    value={label}
                    onChangeText={onChangeLabel}
                    placeholder={t('Название')}
                    placeholderTextColor={resolveTextColor(
                        colors,
                        'labels-tertiary',
                    )}
                    autoFocus
                    returnKeyType="done"
                    style={[styles.input, { color: colors.labels.primary }]}
                />
            </View>

            <AccentColorPicker
                value={color}
                allowNoColor={allowNoColor}
                onChange={onChangeColor}
            />

            <View style={styles.footer}>
                {hasDelete && (
                    <TheButton
                        size="52"
                        variant="secondary"
                        view="destructive"
                        isFlex
                        onPress={onRequestDelete}
                    >
                        {t('Удалить')}
                    </TheButton>
                )}
                <TheButton
                    size="52"
                    variant="primary"
                    view="brand"
                    isFlex={hasDelete}
                    isWide={!hasDelete}
                    isDisabled={!canSubmit}
                    onPress={onSubmit}
                >
                    {t('Сохранить')}
                </TheButton>
            </View>
        </View>
    )
}

function DeleteConfirmContent({
    onCancel,
    onConfirm,
}: {
    onCancel: () => void
    onConfirm: () => void
}) {
    useLanguage()

    const styles = useStyles()

    return (
        <View style={styles.editorBody}>
            <Placeholder
                title={t('Удалить без возможности восстановления?')}
                description={t(
                    'Все данные будут удалены. Это действие нельзя отменить.',
                )}
                style={styles.deletePlaceholder}
            >
                <TheLottie
                    source={lottie.delete}
                    style={styles.deleteAnimation}
                    accessibilityLabel={t('Анимация удаления')}
                />
            </Placeholder>
            <View style={styles.footer}>
                <TheButton
                    size="52"
                    variant="secondary"
                    view="neutral"
                    isFlex
                    onPress={onCancel}
                >
                    {t('Отмена')}
                </TheButton>
                <TheButton
                    size="52"
                    variant="primary"
                    view="destructive"
                    isFlex
                    onPress={onConfirm}
                >
                    {t('Удалить')}
                </TheButton>
            </View>
        </View>
    )
}
