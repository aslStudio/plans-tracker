import { t } from '@/shared/lib/i18n'
import type { RepeatRule, WeekDay } from '@/shared/api'

/** Monday-first, matching the calendar grid's own week order — each paired with the `WeekDay` (`Date.getDay()`) value it toggles. */
export const WEEKDAY_CHIP_OPTIONS: { value: WeekDay; label: string }[] = [
    {
        value: 1,
        get label() {
            return t('Пн')
        },
    },
    {
        value: 2,
        get label() {
            return t('Вт')
        },
    },
    {
        value: 3,
        get label() {
            return t('Ср')
        },
    },
    {
        value: 4,
        get label() {
            return t('Чт')
        },
    },
    {
        value: 5,
        get label() {
            return t('Пт')
        },
    },
    {
        value: 6,
        get label() {
            return t('Сб')
        },
    },
    {
        value: 0,
        get label() {
            return t('Вс')
        },
    },
]

/** Toggles `day` in a weekly repeat's `daysOfWeek`, keeping at least one selected — turning the last remaining day off would leave a rule that's never due. */
export function toggleWeekday(daysOfWeek: WeekDay[], day: WeekDay): WeekDay[] {
    if (daysOfWeek.includes(day)) {
        if (daysOfWeek.length === 1) return daysOfWeek
        return daysOfWeek.filter((existing) => existing !== day)
    }
    return [...daysOfWeek, day].sort((a, b) => a - b)
}

/**
 * The repeat row's own value text — `monthly`/`custom` aren't editable from
 * this screen's picker (only `daily`/`weekly` are, see `WEEKDAY_CHIP_OPTIONS`),
 * but a habit created some other way can still carry either, so both get a
 * sensible read-only label here rather than looking blank.
 */
export function repeatSummaryLabel(repeat: RepeatRule): string {
    switch (repeat.type) {
        case 'daily':
            return t('Каждый день')
        case 'weekly':
            return t('По дням недели')
        case 'monthly':
            return t('Каждое {0} число', [repeat.dayOfMonth])
        case 'custom':
            return t('Каждые {0} дн.', [repeat.everyNDays])
    }
}
