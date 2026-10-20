import { t, useLanguage } from '@/shared/lib/i18n'
import { useState } from 'react'
import { View } from 'react-native'

import { formatShortDate, todayDateString } from '@/shared/lib/date'
import { Icon } from '@/shared/ui/Icon'
import { Row } from '@/shared/ui/Row'
import { TheText } from '@/shared/ui/TheText'
import { WheelPicker } from '@/shared/ui/WheelPicker'

import {
    type DateParts,
    getDayOptions,
    joinDateParts,
    monthOptions,
    splitDateString,
    yearOptions,
} from './date-wheel'
import type { DateWheelRowProps } from './model'
import { useStyles } from './styles'

/** A settings-style `Row` that owns the sheet's open/draft state — tapping it opens a day/month/year `WheelPicker`, "Сбросить" clears the field to `null`, "Применить" commits the draft. */
export function DateWheelRow({ label, value, onChange }: DateWheelRowProps) {
    useLanguage()

    const styles = useStyles()
    const [isOpen, setIsOpen] = useState(false)
    const [draftParts, setDraftParts] = useState<DateParts>(() =>
        splitDateString(value ?? todayDateString()),
    )

    function open() {
        setDraftParts(splitDateString(value ?? todayDateString()))
        setIsOpen(true)
    }

    function changePart(part: keyof DateParts, partValue: string) {
        setDraftParts((current) =>
            splitDateString(joinDateParts({ ...current, [part]: partValue })),
        )
    }

    return (
        <>
            <Row
                label={label}
                onPress={open}
                RightElement={
                    <View style={styles.value}>
                        <TheText
                            size="body"
                            color={
                                value ? 'labels-secondary' : 'labels-tertiary'
                            }
                        >
                            {value ? formatShortDate(value) : t('Не задана')}
                        </TheText>
                        <Icon
                            name="chevron-up-down"
                            size={18}
                            color={
                                value ? 'labels-secondary' : 'labels-tertiary'
                            }
                        />
                    </View>
                }
            />
            <WheelPicker
                isOpen={isOpen}
                title={label}
                setIsOpen={() => setIsOpen(false)}
                onSubmit={() => onChange(joinDateParts(draftParts))}
                onReset={() => onChange(null)}
                columns={[
                    {
                        options: getDayOptions(
                            draftParts.year,
                            draftParts.month,
                        ),
                        value: draftParts.day,
                        onChange: (partValue) => changePart('day', partValue),
                    },
                    {
                        options: monthOptions,
                        value: draftParts.month,
                        onChange: (partValue) => changePart('month', partValue),
                    },
                    {
                        options: yearOptions,
                        value: draftParts.year,
                        onChange: (partValue) => changePart('year', partValue),
                        flex: 1.3,
                    },
                ]}
            />
        </>
    )
}
