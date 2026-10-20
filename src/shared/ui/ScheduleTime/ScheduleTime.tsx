import { t, useLanguage } from '@/shared/lib/i18n'
import { useState } from 'react'
import { View } from 'react-native'
import { Row } from '@/shared/ui/Row'
import { Toggle } from '@/shared/ui/Toggle'
import { Separator } from '@/shared/ui/Separator'
import { Icon } from '@/shared/ui/Icon'
import { Collapsible } from '@/shared/ui/Collapsible'
import { CalendarTimeModal } from '@/widgets/calendar/ui/CalendarTimeModal'

export function ScheduleTime({
    minute,
    duration = 60,
    onChange,
}: {
    minute: number | null
    duration?: number
    onChange: (minute: number | null, duration: number) => void
}) {
    useLanguage()

    const [lastMinute, setLastMinute] = useState(minute ?? 540)
    const [isOpen, setIsOpen] = useState(false)
    const start = minute ?? lastMinute
    const time = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
    const length = `${Math.floor(duration / 60) ? t('{0} ч', [Math.floor(duration / 60)]) + ' ' : ''}${duration % 60 ? t('{0} мин', [duration % 60]) : ''}`
    return (
        <>
            <Row
                label={t('Добавить в календарь')}
                description={t('Запланировать по времени')}
                RightElement={
                    <View
                        style={{
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Toggle
                            testID="show-in-calendar"
                            value={minute != null}
                            onChange={(enabled) => {
                                if (!enabled && minute !== null)
                                    setLastMinute(minute)
                                setIsOpen(false)
                                onChange(enabled ? lastMinute : null, duration)
                            }}
                        />
                    </View>
                }
            />
            <Collapsible visible={minute != null}>
                <Separator offsetLeft={16} />
                <Row
                    label={t('Время и длительность')}
                    description={`${time} · ${length}`}
                    onPress={() => setIsOpen(true)}
                    RightElement={
                        <Icon
                            name="chevron-right"
                            size={19}
                            color="labels-tertiary"
                        />
                    }
                />
            </Collapsible>
            {isOpen && (
                <CalendarTimeModal
                    visible
                    startMinute={start}
                    duration={duration}
                    onClose={() => setIsOpen(false)}
                    onSave={onChange}
                />
            )}
        </>
    )
}
