import { t, localizedLabels, useLanguage } from '@/shared/lib/i18n'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { RepeatRule, WeekDay } from '@/shared/api'
import { useSelectedOptionScroll } from '@/shared/lib/hooks/use-selected-option-scroll'
import { parseLocalDateString } from '@/shared/lib/date'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Collapsible } from '@/shared/ui/Collapsible'
import { Row } from '@/shared/ui/Row'
import { Separator } from '@/shared/ui/Separator'
import { useStyles } from './EventEditor.styles'
const repeatChoices = [
    {
        key: 'once',
        get label() {
            return t('Не повторять')
        },
    },
    {
        key: 'daily',
        get label() {
            return t('Каждый день')
        },
    },
    {
        key: 'weekly',
        get label() {
            return t('Каждую неделю')
        },
    },
    {
        key: 'monthly',
        get label() {
            return t('Каждый месяц')
        },
    },
    {
        key: 'custom',
        get label() {
            return t('Интервал')
        },
    },
] as const
const weekdays = localizedLabels(['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'])
export const repeatLabel = (repeat: RepeatRule | null | undefined) => {
    if (!repeat) return t('Без повторения')
    if (repeat.type === 'daily') return t('Каждый день')
    if (repeat.type === 'monthly') return t('Каждый месяц')
    if (repeat.type === 'custom')
        return t('Каждые {0} дн.', [repeat.everyNDays])
    return t('Еженедельно · {0}', [
        repeat.daysOfWeek.map((d) => weekdays[d]).join(', '),
    ])
}

export function RepeatFields({
    repeat,
    date,
    onChange,
    allowOnce = true,
    toggleSelection = false,
}: {
    repeat: RepeatRule | null
    date: string
    onChange: (repeat: RepeatRule | null) => void
    allowOnce?: boolean
    /** Optional recurrence can be cleared by tapping its selected cadence. */
    toggleSelection?: boolean
}) {
    useLanguage()

    const { scrollProps, onOptionLayout } = useSelectedOptionScroll(
        repeat?.type ?? (toggleSelection ? null : 'once'),
    )
    const styles = useStyles()
    const { colors } = useTheme()
    const draft = { repeat, date }
    const patch = (value: { repeat: RepeatRule | null }) =>
        onChange(value.repeat)
    const button = (label: string, action: () => void, active = false) => (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={action}
            style={[
                styles.chip,
                {
                    backgroundColor: active
                        ? colors.brandSecondary
                        : colors.fill.tertiary,
                },
            ]}
        >
            <Text
                style={[
                    styles.chipLabel,
                    {
                        color: active ? colors.brand : colors.labels.primary,
                    },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    )
    return (
        <>
            <Row
                label={t('Повторение')}
                description={repeatLabel(draft.repeat)}
            />
            <ScrollView
                {...scrollProps}
                horizontal
                style={styles.horizontalScroll}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.repeatRow}
            >
                {repeatChoices
                    .filter(
                        ({ key }) =>
                            key !== 'once' || (allowOnce && !toggleSelection),
                    )
                    .map(({ key, label }) => (
                        <View key={key} onLayout={onOptionLayout(key)}>
                            {button(
                                label,
                                () => {
                                    if (
                                        allowOnce &&
                                        toggleSelection &&
                                        draft.repeat?.type === key
                                    ) {
                                        patch({ repeat: null })
                                        return
                                    }
                                    if (key === 'once')
                                        patch({
                                            repeat: null,
                                        })
                                    else if (key === 'daily')
                                        patch({
                                            repeat: { type: 'daily' },
                                        })
                                    else if (key === 'weekly')
                                        patch({
                                            repeat: {
                                                type: 'weekly',
                                                daysOfWeek: [
                                                    parseLocalDateString(
                                                        draft.date,
                                                    ).getDay() as WeekDay,
                                                ],
                                            },
                                        })
                                    else if (key === 'monthly')
                                        patch({
                                            repeat: {
                                                type: 'monthly',
                                                dayOfMonth:
                                                    parseLocalDateString(
                                                        draft.date,
                                                    ).getDate(),
                                            },
                                        })
                                    else
                                        patch({
                                            repeat: {
                                                type: 'custom',
                                                everyNDays: 2,
                                            },
                                        })
                                },
                                key === 'once'
                                    ? !draft.repeat
                                    : draft.repeat?.type === key,
                            )}
                        </View>
                    ))}
            </ScrollView>
            <Collapsible visible={draft.repeat?.type === 'weekly'}>
                <Separator offsetLeft={16} />
                <ScrollView
                    horizontal
                    style={styles.horizontalScroll}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.repeatRow}
                >
                    {weekdays.map((label, day) => (
                        <View key={label}>
                            {button(
                                label,
                                () => {
                                    const current =
                                        draft.repeat?.type === 'weekly'
                                            ? draft.repeat.daysOfWeek
                                            : []
                                    if (
                                        current.length === 1 &&
                                        current.includes(day as WeekDay)
                                    )
                                        return
                                    patch({
                                        repeat: {
                                            type: 'weekly',
                                            daysOfWeek: current.includes(
                                                day as WeekDay,
                                            )
                                                ? current.filter(
                                                      (d) => d !== day,
                                                  )
                                                : [...current, day as WeekDay],
                                        },
                                    })
                                },
                                draft.repeat?.type === 'weekly' &&
                                    draft.repeat.daysOfWeek.includes(
                                        day as WeekDay,
                                    ),
                            )}
                        </View>
                    ))}
                </ScrollView>
            </Collapsible>
            <Collapsible visible={draft.repeat?.type === 'custom'}>
                <Separator offsetLeft={16} />
                <Row
                    label={t('Повторять каждые')}
                    description={t('Дней')}
                    RightElement={
                        <TextInput
                            accessibilityLabel={t('Интервал повторения в днях')}
                            keyboardType="number-pad"
                            value={String(
                                draft.repeat?.type === 'custom'
                                    ? draft.repeat.everyNDays
                                    : 2,
                            )}
                            onChangeText={(v) =>
                                draft.repeat?.type === 'custom' &&
                                patch({
                                    repeat: {
                                        type: 'custom',
                                        everyNDays: Math.max(
                                            1,
                                            Math.floor(Number(v) || 1),
                                        ),
                                    },
                                })
                            }
                            style={[
                                styles.numberInput,
                                {
                                    color: colors.labels.primary,
                                    backgroundColor: colors.fill.tertiary,
                                },
                            ]}
                        />
                    }
                />
            </Collapsible>
        </>
    )
}
