import { t, useLanguage } from '@/shared/lib/i18n'
import { TheBottomSheet } from '@/shared/ui/TheBottomSheet'
import { TheButton } from '@/shared/ui/TheButton'
import { useEffect, useRef, useState } from 'react'
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useStyles } from './CalendarTimeModal.styles'

const ROW = 42
function WheelColumn({
    label,
    unitLabel,
    value,
    values,
    onChange,
}: {
    label: string
    unitLabel: string
    value: number
    values: number[]
    onChange: (value: number) => void
}) {
    const { colors } = useTheme()
    const styles = useStyles()
    const ref = useRef<FlatList<number>>(null)
    const initialized = useRef(false)
    useEffect(() => {
        if (initialized.current) return
        const i = values.indexOf(value)
        if (i >= 0) {
            requestAnimationFrame(() =>
                ref.current?.scrollToOffset({
                    offset: i * ROW,
                    animated: false,
                }),
            )
            initialized.current = true
        }
    }, [value, values])
    const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.max(
            0,
            Math.min(
                values.length - 1,
                Math.round(event.nativeEvent.contentOffset.y / ROW),
            ),
        )
        onChange(values[index])
    }
    return (
        <View style={styles.column}>
            <Text style={[styles.unitLabel, { color: colors.labels.tertiary }]}>
                {unitLabel}
            </Text>
            <View style={styles.wheelViewport}>
                <View
                    style={[
                        styles.selection,
                        { backgroundColor: colors.fill.tertiary },
                    ]}
                />
                <FlatList
                    ref={ref}
                    testID={`wheel-${label}`}
                    data={values}
                    keyExtractor={(v) => String(v)}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ROW}
                    decelerationRate="fast"
                    onMomentumScrollEnd={settle}
                    getItemLayout={(_, index) => ({
                        length: ROW,
                        offset: ROW * index,
                        index,
                    })}
                    style={StyleSheet.absoluteFill}
                    contentContainerStyle={styles.wheelContent}
                    renderItem={({ item }) => (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${label} ${String(item).padStart(2, '0')}`}
                            onPress={() => {
                                onChange(item)
                                ref.current?.scrollToOffset({
                                    offset: values.indexOf(item) * ROW,
                                    animated: true,
                                })
                            }}
                            style={styles.value}
                        >
                            <Text
                                style={[
                                    styles.wheelItem,
                                    {
                                        color:
                                            item === value
                                                ? colors.labels.primary
                                                : colors.labels.tertiary,
                                        opacity: item === value ? 1 : 0.48,
                                    },
                                ]}
                            >
                                {String(item).padStart(2, '0')}
                            </Text>
                        </Pressable>
                    )}
                />
            </View>
        </View>
    )
}
export function CalendarTimeModal({
    visible,
    startMinute,
    duration,
    onClose,
    onSave,
}: {
    visible: boolean
    startMinute: number
    duration: number
    onClose: () => void
    onSave: (start: number, duration: number) => void
}) {
    useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const [hour, setHour] = useState(Math.floor(startMinute / 60))
    const [minute, setMinute] = useState(startMinute % 60)
    const [durationHours, setDurationHours] = useState(
        Math.floor(duration / 60),
    )
    const [durationMinutes, setDurationMinutes] = useState(duration % 60)
    const start = hour * 60 + minute
    const max = 1440 - start
    const length = Math.max(
        1,
        Math.min(max, durationHours * 60 + durationMinutes),
    )
    return (
        <TheBottomSheet visible={visible} onClose={onClose}>
            {(dismiss) => (
                <View style={styles.content}>
                    <Text
                        style={[
                            styles.modalTitle,
                            { color: colors.labels.primary },
                        ]}
                    >
                        {t('Время и длительность')}
                    </Text>
                    <View style={styles.wheels}>
                        <View style={styles.group}>
                            <Text
                                style={[
                                    styles.groupTitle,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {t('Начало')}
                            </Text>
                            <View style={styles.pair}>
                                <WheelColumn
                                    label={t('Начало · часы')}
                                    unitLabel={t('ч')}
                                    value={hour}
                                    values={Array.from(
                                        { length: 24 },
                                        (_, i) => i,
                                    )}
                                    onChange={setHour}
                                />
                                <Text
                                    style={[
                                        styles.colon,
                                        { color: colors.labels.primary },
                                    ]}
                                >
                                    :
                                </Text>
                                <WheelColumn
                                    label={t('Начало · минуты')}
                                    unitLabel={t('мин')}
                                    value={minute}
                                    values={Array.from(
                                        { length: 60 },
                                        (_, i) => i,
                                    )}
                                    onChange={setMinute}
                                />
                            </View>
                        </View>
                        <View
                            style={[
                                styles.divider,
                                { backgroundColor: colors.separator.opaque },
                            ]}
                        />
                        <View style={styles.group}>
                            <Text
                                style={[
                                    styles.groupTitle,
                                    { color: colors.labels.secondary },
                                ]}
                            >
                                {t('Длительность')}
                            </Text>
                            <View style={styles.pair}>
                                <WheelColumn
                                    label={t('Длительность · часы')}
                                    unitLabel={t('ч')}
                                    value={Math.floor(length / 60)}
                                    values={Array.from(
                                        {
                                            length: Math.min(
                                                25,
                                                Math.floor(max / 60) + 1,
                                            ),
                                        },
                                        (_, i) => i,
                                    )}
                                    onChange={(v) => {
                                        setDurationHours(v)
                                        if (v * 60 + durationMinutes > max)
                                            setDurationMinutes(max % 60)
                                    }}
                                />
                                <Text
                                    style={[
                                        styles.colon,
                                        { color: colors.labels.primary },
                                    ]}
                                >
                                    :
                                </Text>
                                <WheelColumn
                                    label={t('Длительность · минуты')}
                                    unitLabel={t('мин')}
                                    value={length % 60}
                                    values={Array.from(
                                        {
                                            length: Math.min(
                                                60,
                                                Math.max(
                                                    1,
                                                    max -
                                                        Math.floor(
                                                            length / 60,
                                                        ) *
                                                            60 +
                                                        1,
                                                ),
                                            ),
                                        },
                                        (_, i) => i,
                                    )}
                                    onChange={setDurationMinutes}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.actions}>
                        <TheButton
                            size="52"
                            variant="secondary"
                            view="neutral"
                            isFlex
                            onPress={() => dismiss(onClose)}
                        >
                            {t('Отмена')}
                        </TheButton>
                        <TheButton
                            size="52"
                            variant="primary"
                            view="brand"
                            isFlex
                            onPress={() =>
                                dismiss(() => {
                                    onSave(start, length)
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
