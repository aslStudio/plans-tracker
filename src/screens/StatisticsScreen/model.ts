import { t } from '@/shared/lib/i18n'
import {
    addDays,
    parseLocalDateString,
    toLocalDateString,
} from '@/shared/lib/date'
export type Period = 'week' | 'month' | 'year'
export function periodRange(anchor: string, period: Period) {
    const date = parseLocalDateString(anchor)
    const year = date.getFullYear(),
        month = date.getMonth()
    const start =
        period === 'year'
            ? `${year}-01-01`
            : period === 'month'
              ? toLocalDateString(new Date(year, month, 1))
              : addDays(anchor, -(date.getDay() + 6) % 7)
    const end =
        period === 'year'
            ? `${year}-12-31`
            : period === 'month'
              ? toLocalDateString(new Date(year, month + 1, 0))
              : addDays(start, 6)
    return { start, end }
}
export function movePeriod(anchor: string, period: Period, direction: number) {
    const { start } = periodRange(anchor, period)
    const date = parseLocalDateString(start)
    if (period === 'week') return addDays(start, direction * 7)
    if (period === 'month') date.setMonth(date.getMonth() + direction)
    else date.setFullYear(date.getFullYear() + direction)
    return toLocalDateString(date)
}
export function periodDays(anchor: string, period: Period) {
    const { start, end } = periodRange(anchor, period)
    const dates: string[] = []
    for (let day = start; day <= end; day = addDays(day, 1)) dates.push(day)
    return dates
}

export type ProgressDay = { date: string; done: number; total: number }
export type StatisticsBucket = ProgressDay & {
    future: boolean
    rate: number | null
    label: string
}

/** Calendar days through today plus future dates with recorded completions.
 * Empty elapsed days contribute zero; uncompleted future dates do not.
 */
export function buildStatistics(
    anchor: string,
    period: Period,
    today: string,
    progress: (date: string) => { done: number; total: number },
) {
    const { start } = periodRange(anchor, period)
    const days: ProgressDay[] = []
    for (const date of periodDays(anchor, period)) {
        days.push({
            date,
            ...progress(date),
        })
    }
    const active = days.filter((day) => day.date <= today || day.done > 0)
    const done = active.reduce((sum, day) => sum + day.done, 0)
    const total = active.reduce((sum, day) => sum + day.total, 0)
    const meanRate = (items: ProgressDay[]) =>
        items.length
            ? items.reduce(
                  (sum, day) =>
                      sum + (day.total > 0 ? (day.done / day.total) * 100 : 0),
                  0,
              ) / items.length
            : null
    const buckets: StatisticsBucket[] =
        period === 'year'
            ? Array.from({ length: 12 }, (_, month) => {
                  const date = `${start.slice(0, 4)}-${String(month + 1).padStart(2, '0')}`
                  const items = active.filter((day) =>
                      day.date.startsWith(date),
                  )
                  return {
                      date,
                      done: items.reduce((sum, day) => sum + day.done, 0),
                      total: items.reduce((sum, day) => sum + day.total, 0),
                      rate: meanRate(items),
                      future:
                          `${date}-01` > today &&
                          !items.some((day) => day.done > 0),
                      label: [
                          t('янв'),
                          t('фев'),
                          t('мар'),
                          t('апр'),
                          t('май'),
                          t('июн'),
                          t('июл'),
                          t('авг'),
                          t('сен'),
                          t('окт'),
                          t('ноя'),
                          t('дек'),
                      ][month],
                  }
              })
            : days.map((day) => ({
                  ...day,
                  future: day.date > today && day.done === 0,
                  rate:
                      day.total > 0 && (day.date <= today || day.done > 0)
                          ? (day.done / day.total) * 100
                          : null,
                  label: String(Number(day.date.slice(-2))),
              }))
    return {
        buckets,
        done,
        total,
        averageRate: meanRate(active),
        averageDone: active.length ? done / active.length : null,
        completeDays: active.filter(
            (day) => day.total > 0 && day.done === day.total,
        ).length,
        activeDays: active.length,
    }
}

/** A scheduled elapsed occurrence or an early completion is visible history. */
export function hasStatisticsData(
    anchor: string,
    period: Period,
    today: string,
    progress: (date: string) => { done: number; total: number },
) {
    return periodDays(anchor, period).some((date) => {
        const day = progress(date)
        return day.done > 0 || (date <= today && day.total > 0)
    })
}
