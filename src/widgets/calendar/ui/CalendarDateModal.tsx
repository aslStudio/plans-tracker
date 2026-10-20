import { t, useLanguage } from '@/shared/lib/i18n'
import { TheBottomSheet } from '@/shared/ui/TheBottomSheet'
import { TheButton } from '@/shared/ui/TheButton'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { toLocalDateString, parseLocalDateString } from '@/shared/lib/date'
import {
    addMonths,
    buildMonthGrid,
    formatMonthLabel,
    WEEKDAY_LABELS,
} from '@/shared/lib/calendar-grid'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'
import { useStyles } from './CalendarDateModal.styles'

export function CalendarDateModal({
    visible,
    value,
    onClose,
    onSave,
    title = t('Выберите дату'),
}: {
    visible: boolean
    value: string
    onClose: () => void
    onSave: (date: string) => void
    title?: string
}) {
    useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const [selected, setSelected] = useState(value)
    const [month, setMonth] = useState(
        () =>
            new Date(
                parseLocalDateString(value).getFullYear(),
                parseLocalDateString(value).getMonth(),
                1,
            ),
    )
    return (
        <TheBottomSheet visible={visible} onClose={onClose}>
            {(dismiss) => (
                <View style={styles.content}>
                    <Text
                        style={[
                            styles.modalTitle,
                            { color: colors.labels.secondary },
                        ]}
                    >
                        {title}
                    </Text>
                    <View style={styles.header}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('Предыдущий месяц')}
                            onPress={() => setMonth((d) => addMonths(d, -1))}
                            style={[
                                styles.arrow,
                                { backgroundColor: colors.fill.tertiary },
                            ]}
                        >
                            <Icon
                                name="chevron-left"
                                size={22}
                                color="labels-primary"
                            />
                        </Pressable>
                        <Text
                            style={[
                                styles.monthLabel,
                                { color: colors.labels.primary },
                            ]}
                        >
                            {formatMonthLabel(month)}
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('Следующий месяц')}
                            onPress={() => setMonth((d) => addMonths(d, 1))}
                            style={[
                                styles.arrow,
                                { backgroundColor: colors.fill.tertiary },
                            ]}
                        >
                            <Icon
                                name="chevron-right"
                                size={22}
                                color="labels-primary"
                            />
                        </Pressable>
                    </View>
                    <View style={styles.row}>
                        {WEEKDAY_LABELS.map((label) => (
                            <Text
                                key={label}
                                style={[
                                    styles.weekday,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {label}
                            </Text>
                        ))}
                    </View>
                    {buildMonthGrid(month).map((week, row) => (
                        <View key={row} style={styles.row}>
                            {week.map((cell, i) => {
                                const active = cell?.date === selected
                                const inMonth =
                                    cell?.date.slice(0, 7) ===
                                    toLocalDateString(month).slice(0, 7)
                                return (
                                    <Pressable
                                        key={cell?.date ?? `blank-${i}`}
                                        disabled={!cell || !inMonth}
                                        accessibilityRole="button"
                                        accessibilityLabel={cell?.date}
                                        accessibilityState={{
                                            selected: active,
                                        }}
                                        onPress={() =>
                                            cell && setSelected(cell.date)
                                        }
                                        style={styles.dayCell}
                                    >
                                        {cell && (
                                            <View
                                                style={[
                                                    styles.day,
                                                    {
                                                        backgroundColor: active
                                                            ? colors.brand
                                                            : 'transparent',
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dayLabel,
                                                        {
                                                            color: active
                                                                ? colors.gray
                                                                      .white
                                                                : colors.labels
                                                                      .primary,
                                                            fontWeight: active
                                                                ? '700'
                                                                : '500',
                                                        },
                                                    ]}
                                                >
                                                    {cell.day}
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>
                                )
                            })}
                        </View>
                    ))}
                    <View style={styles.footer}>
                        <TheButton
                            size="52"
                            variant="secondary"
                            view="neutral"
                            isFlex
                            onPress={() => {
                                const today = toLocalDateString(new Date())
                                setSelected(today)
                                setMonth(parseLocalDateString(today))
                            }}
                        >
                            {t('Сегодня')}
                        </TheButton>
                        <TheButton
                            size="52"
                            variant="primary"
                            view="brand"
                            isFlex
                            onPress={() =>
                                dismiss(() => {
                                    onSave(selected)
                                    onClose()
                                })
                            }
                        >
                            {t('Готово')}
                        </TheButton>
                    </View>
                </View>
            )}
        </TheBottomSheet>
    )
}
