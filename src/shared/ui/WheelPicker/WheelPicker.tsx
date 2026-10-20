import { t, useLanguage } from '@/shared/lib/i18n'
import { Picker } from '@react-native-picker/picker'
import { Platform, View } from 'react-native'
import { TheBottomSheet } from '@/shared/ui/TheBottomSheet'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'

import { type WheelPickerProps } from './model'
import { useStyles } from './styles'

export function WheelPicker({
    isOpen,
    title,
    columns,
    setIsOpen,
    onSubmit,
    onReset,
    resetLabel,
    submitLabel,
}: WheelPickerProps) {
    return (
        <TheBottomSheet visible={isOpen} onClose={setIsOpen}>
            {(dismiss) => (
                <WheelPickerContent
                    title={title}
                    columns={columns}
                    setIsOpen={() => dismiss(setIsOpen)}
                    onSubmit={() =>
                        dismiss(() => {
                            onSubmit()
                            setIsOpen()
                        })
                    }
                    onReset={
                        onReset
                            ? () =>
                                  dismiss(() => {
                                      onReset()
                                      setIsOpen()
                                  })
                            : undefined
                    }
                    resetLabel={resetLabel}
                    submitLabel={submitLabel}
                />
            )}
        </TheBottomSheet>
    )
}

function WheelPickerContent({
    title,
    columns,
    setIsOpen,
    onSubmit,
    onReset,
    resetLabel = t('Сбросить'),
    submitLabel = t('Применить'),
}: Omit<WheelPickerProps, 'isOpen'>) {
    useLanguage()

    const styles = useStyles()
    const theme = useTheme()

    return (
        <View>
            <View style={styles.header}>
                {title ? (
                    <TheText size="subheadline" weight="600">
                        {title}
                    </TheText>
                ) : (
                    <View />
                )}
                <TheButtonIcon
                    icon="xmark"
                    size="36"
                    variant="plain"
                    view="neutral"
                    accessibilityLabel={t('Закрыть')}
                    onPress={setIsOpen}
                />
            </View>
            <View style={styles.columns}>
                {columns.map((column, index) => (
                    <Picker<string>
                        key={index}
                        style={[styles.picker, { flex: column.flex ?? 1 }]}
                        selectedValue={column.value}
                        onValueChange={(itemValue) =>
                            column.onChange(itemValue)
                        }
                        mode={
                            Platform.OS === 'android' ? 'dropdown' : undefined
                        }
                        itemStyle={{ color: theme.colors.labels.primary }}
                    >
                        {column.options.map((option) => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                            />
                        ))}
                    </Picker>
                ))}
            </View>
            <View style={styles.footer}>
                {onReset && (
                    <TheButton
                        size="52"
                        variant="secondary"
                        view="neutral"
                        isFlex
                        onPress={onReset}
                    >
                        {resetLabel}
                    </TheButton>
                )}
                <TheButton
                    size="52"
                    variant="primary"
                    view="brand"
                    isFlex={Boolean(onReset)}
                    isWide={!onReset}
                    onPress={onSubmit}
                >
                    {submitLabel}
                </TheButton>
            </View>
        </View>
    )
}
