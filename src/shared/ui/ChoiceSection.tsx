import { t, useLanguage } from '@/shared/lib/i18n'
import { useRef, useState } from 'react'
import {
    EntityEditorSheet,
    type EntityEditorValue,
} from '@/shared/ui/EntityEditorSheet'
import { Toggle } from '@/shared/ui/Toggle'
import { Collapsible } from '@/shared/ui/Collapsible'
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native'
import type { Color } from '@/shared/config/color'
import { useSelectedOptionScroll } from '@/shared/lib/hooks/use-selected-option-scroll'
import { hapticSelect } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Row } from '@/shared/ui/Row'
import { Section } from '@/shared/ui/Section'
import { TheText } from '@/shared/ui/TheText'

type Choice = { id: string | null; label: string; color?: Color }

export function ChoiceSection({
    title,
    options,
    value,
    onChange,
    emptyLabel = '',
    toggleable = false,
    creation,
}: {
    title: string
    creation?: {
        title: string
        allowNoColor: boolean
        onSubmit: (value: EntityEditorValue) => Promise<{ id: string }>
    }
    emptyLabel?: string
    toggleable?: boolean
    options: Choice[]
    value: string | null
    onChange: (value: string | null) => void
}) {
    useLanguage()

    const [creating, setCreating] = useState(false)
    const submitting = useRef(false)
    const { colors } = useTheme()
    const { scrollProps, onOptionLayout } = useSelectedOptionScroll(value)
    return (
        <Section paddingBottom={8}>
            <Row
                label={title}
                RightElement={
                    toggleable ? (
                        <Toggle
                            testID={`choice-toggle-${title}`}
                            accessibilityLabel={title}
                            value={value !== null}
                            disabled={options.length === 0 && !creation}
                            onChange={(enabled) => {
                                if (enabled && !options.length && creation)
                                    setCreating(true)
                                else
                                    onChange(
                                        enabled
                                            ? (options[0]?.id ?? null)
                                            : null,
                                    )
                            }}
                        />
                    ) : undefined
                }
                description={
                    options.find((option) => option.id === value)?.label ??
                    emptyLabel
                }
            />
            {(options.length > 0 || creation) && (
                <Collapsible visible={!toggleable || value !== null}>
                    <ScrollView
                        {...scrollProps}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={styles.scroll}
                        contentContainerStyle={styles.options}
                    >
                        {options.map((option) => {
                            const selected = option.id === value
                            return (
                                <Pressable
                                    key={option.id ?? 'none'}
                                    onLayout={onOptionLayout(
                                        option.id ?? 'none',
                                    )}
                                    accessibilityRole="radio"
                                    accessibilityLabel={option.label}
                                    accessibilityState={{ selected }}
                                    onPress={() => {
                                        if (!selected) {
                                            hapticSelect()
                                            onChange(option.id)
                                        }
                                    }}
                                    style={[
                                        styles.chip,
                                        {
                                            backgroundColor: selected
                                                ? colors.brandSecondary
                                                : colors.fill.tertiary,
                                        },
                                    ]}
                                >
                                    <TheText
                                        size="subheadline"
                                        weight="600"
                                        color={
                                            option.color ??
                                            (selected
                                                ? 'brand'
                                                : 'labels-primary')
                                        }
                                    >
                                        {option.label}
                                    </TheText>
                                </Pressable>
                            )
                        })}
                        {creation && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={creation.title}
                                onPress={() => {
                                    hapticSelect()
                                    setCreating(true)
                                }}
                                style={[
                                    styles.chip,
                                    { backgroundColor: colors.brand },
                                ]}
                            >
                                <TheText
                                    size="subheadline"
                                    weight="600"
                                    color="gray-white"
                                >
                                    {t('+ Добавить')}
                                </TheText>
                            </Pressable>
                        )}
                    </ScrollView>
                </Collapsible>
            )}
            {creating && creation && (
                <EntityEditorSheet
                    title={creation.title}
                    allowNoColor={creation.allowNoColor}
                    initialValue={{
                        label: '',
                        color: creation.allowNoColor ? null : 'accent-blue',
                    }}
                    onClose={() => setCreating(false)}
                    onSubmit={(input) => {
                        if (submitting.current) return
                        submitting.current = true
                        setCreating(false)
                        void creation
                            .onSubmit(input)
                            .then((created) => onChange(created.id))
                            .catch(() =>
                                Alert.alert(
                                    t('Не удалось создать'),
                                    t('Попробуйте ещё раз.'),
                                ),
                            )
                            .finally(() => {
                                submitting.current = false
                            })
                    }}
                />
            )}
        </Section>
    )
}
const styles = StyleSheet.create({
    scroll: { flexGrow: 0, flexShrink: 0 },
    options: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
    chip: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16 },
})
