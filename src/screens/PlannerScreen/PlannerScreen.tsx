import { t, getLocale, useLanguage } from '@/shared/lib/i18n'
import { useArchiveVersion } from '@/shared/lib/memory/archive'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Platform,
    Pressable,
    Text,
    useWindowDimensions,
    View,
} from 'react-native'
import Animated, { useSharedValue } from 'react-native-reanimated'
import { Collapsible } from '@/shared/ui/Collapsible'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    habitsRepository,
    tasksRepository,
    type Task,
    type Habit,
    type TaskCompletion,
    type HabitCompletion,
    type TaskStatus,
} from '@/shared/api'
import type {
    CalendarEvent,
    CalendarSettings,
    CalendarViewMode,
} from '@/shared/api/calendar/model'
import {
    calendarRepository,
    calendarSettings,
} from '@/shared/api/calendar/repository'
import { rescheduleNotifications } from '@/features/manage-notification-settings'
import { logError } from '@/shared/lib/diagnostics/app-logger'
import {
    addDays,
    parseLocalDateString,
    todayDateString,
    toLocalDateString,
} from '@/shared/lib/date'
import {
    addMonths,
    formatMonthLabel,
    WEEKDAY_LABELS,
} from '@/shared/lib/calendar-grid'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'
import { NativeMenu, type NativeMenuItem } from '@/shared/ui/NativeMenu'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { TheText } from '@/shared/ui/TheText'
import {
    agendaForDate,
    draftFromUnplanned,
    emptyEvent,
    timeLabel,
    unplannedForDate,
    type AgendaItem,
} from '@/entities/calendar-event'
import {
    CalendarMonth,
    CalendarMultiDayTimeline,
    CalendarTimeline,
    HOUR_HEIGHT,
    UnplannedTray,
} from '@/widgets/calendar'
import { useCalendarDrag } from '@/features/reschedule-event-by-drag'
import { CalendarPage, type CalendarMotion } from './CalendarMotion'
import { useStyles } from './PlannerScreen.styles'

type ViewMode = CalendarViewMode

const VIEW_RANK: Record<ViewMode, number> = {
    day: 0,
    '3day': 1,
    week: 2,
    month: 3,
}
const VIEW_LABELS: Record<ViewMode, string> = {
    get day() {
        return t('День')
    },
    get '3day'() {
        return t('3 дня')
    },
    get week() {
        return t('Неделя')
    },
    get month() {
        return t('Месяц')
    },
}
const PREV_LABELS: Record<ViewMode, string> = {
    get day() {
        return t('Предыдущий день')
    },
    get '3day'() {
        return t('Предыдущие 3 дня')
    },
    get week() {
        return t('Предыдущая неделя')
    },
    get month() {
        return t('Предыдущий месяц')
    },
}
const NEXT_LABELS: Record<ViewMode, string> = {
    get day() {
        return t('Следующий день')
    },
    get '3day'() {
        return t('Следующие 3 дня')
    },
    get week() {
        return t('Следующая неделя')
    },
    get month() {
        return t('Следующий месяц')
    },
}

export function PlannerScreen() {
    const language = useLanguage()

    const { colors } = useTheme()
    const styles = useStyles()
    const insets = useSafeAreaInsets()
    const window = useWindowDimensions()
    const router = useRouter()
    const [selected, setSelected] = useState(todayDateString)
    const [viewPreference, setViewPreference] = useState<{
        mode: ViewMode
        initialized: boolean
    }>({ mode: 'day', initialized: false })
    const view = viewPreference.mode
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [habits, setHabits] = useState<Habit[]>([])
    const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([])
    const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([])
    const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(
        [],
    )
    const [settings, setSettings] = useState<CalendarSettings>({
        showTasks: true,
        showHabits: true,
    })
    const openEditor = useCallback(
        (event: CalendarEvent) => {
            // Recompute localized values when the app language changes.
            void language

            router.push({
                pathname: '/plan/[id]',
                params: {
                    id: event.id || 'new',
                    day: selected,
                    draft: JSON.stringify(event),
                },
            })
        },
        [language, router, selected],
    )
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    // `Collapsible` measures its content on mount, including while closed —
    // mounting it already `visible` the very same render its content first
    // goes from empty to real (right as loading finishes) races that
    // measurement against the height it's animating open to. Staying
    // `false` for one extra render lets it measure the real content while
    // still closed, then the next render's flip to `true` is a plain,
    // already-measured open — the same path toggling the header manually
    // already relies on.
    const [unplannedReady, setUnplannedReady] = useState(false)
    useEffect(() => {
        // The extra render this deliberately causes is the point — see the
        // comment above.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!loading && !error) setUnplannedReady(true)
    }, [loading, error])
    const [now, setNow] = useState(new Date())
    const motion = useSharedValue<CalendarMotion>({
        kind: 'slide',
        direction: 1,
        x: 0,
        y: 0,
    })
    const {
        rootRef,
        viewportRef,
        scrollRef,
        onOffset,
        item: draggingItem,
        minute: dropMinute,
        ghostStyle,
        handlers: dragHandlers,
        measure,
    } = useCalendarDrag(HOUR_HEIGHT, (item, minute) =>
        openEditor(draftFromUnplanned(item, selected, minute)),
    )
    const archiveVersion = useArchiveVersion()
    const load = useCallback(async () => {
        // Recompute localized values when the app language changes.
        void language

        const [e, t, h, s, statuses, taskDone, habitDone] = await Promise.all([
            calendarRepository.list(),
            tasksRepository.list(),
            habitsRepository.list(),
            calendarSettings.get(),
            tasksRepository.listStatuses(),
            tasksRepository.listAllCompletions(),
            habitsRepository.listAllCompletions(),
        ])
        setEvents(e)
        setTasks(t)
        setHabits(h)
        setSettings(s)
        setViewPreference((current) =>
            current.initialized
                ? current
                : { mode: s.viewMode ?? 'day', initialized: true },
        )
        setTaskStatuses(statuses)
        setTaskCompletions(taskDone)
        setHabitCompletions(habitDone)
        setError('')
        setLoading(false)
        void rescheduleNotifications().catch((err) =>
            logError('notifications', 'reschedule_failed', err),
        )
    }, [language])
    useFocusEffect(
        useCallback(() => {
            // Recompute localized values when the app language changes.
            void language

            let active = true
            void load().catch(() => {
                if (active) {
                    setError(t('Не удалось загрузить календарь'))
                    setLoading(false)
                }
            })
            return () => {
                active = false
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps -- The cloud revision invalidates repository reads even without navigation.
        }, [language, load, archiveVersion]),
    )
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000)
        return () => clearInterval(timer)
    }, [])
    const date = parseLocalDateString(selected)
    const completionState = useMemo(() => {
        void language
        return { taskStatuses, taskCompletions, habitCompletions }
    }, [language, taskStatuses, taskCompletions, habitCompletions])
    const today = toLocalDateString(now)
    const monday = addDays(selected, -((date.getDay() + 6) % 7))
    const dayItems = useMemo(() => {
        void language
        return agendaForDate(
            events,
            tasks,
            habits,
            selected,
            settings.showTasks,
            settings.showHabits,
            completionState,
        )
    }, [language, events, tasks, habits, selected, settings, completionState])
    const unplanned = useMemo(() => {
        void language
        return unplannedForDate(
            events,
            tasks,
            habits,
            selected,
            settings.showTasks,
            settings.showHabits,
            completionState,
        )
    }, [language, events, tasks, habits, selected, settings, completionState])
    const text = { color: colors.labels.primary }
    function chooseDate(next: string) {
        if (next === selected) return
        motion.set({
            kind: 'slide',
            direction: next > selected ? 1 : -1,
            x: 0,
            y: 0,
        })
        setSelected(next)
    }
    /** Moves by the current view's own granularity — a day, 3 days, a week, or a month. */
    function shift(direction: number) {
        motion.set({ kind: 'slide', direction, x: 0, y: 0 })
        setSelected((current) =>
            view === 'month'
                ? toLocalDateString(
                      addMonths(parseLocalDateString(current), direction),
                  )
                : addDays(
                      current,
                      direction *
                          (view === 'week' ? 7 : view === '3day' ? 3 : 1),
                  ),
        )
    }
    /** The day-picker strip always pages by a full week, independent of the main view. */
    function shiftWeekStrip(direction: number) {
        motion.set({ kind: 'slide', direction, x: 0, y: 0 })
        setSelected((current) => addDays(current, direction * 7))
    }
    function changeView(next: ViewMode, nextDate = selected, x = 0, y = 0) {
        motion.set({
            kind: VIEW_RANK[next] < VIEW_RANK[view] ? 'zoomIn' : 'zoomOut',
            direction: 0,
            x: x * window.width,
            y: y * window.height * 0.6,
        })
        setSelected(nextDate)
        setViewPreference({ mode: next, initialized: true })
        void calendarSettings.update({ viewMode: next }).catch((err) => {
            void logError('calendar', 'save_view_mode_failed', err)
        })
    }
    function open(item: AgendaItem) {
        if (item.source === 'task') router.push(`/task/${item.id}`)
        else if (item.source === 'habit') router.push(`/habit/${item.id}`)
        else openEditor(events.find((e) => e.id === item.id) ?? item)
    }
    const initialOffset = Math.max(
        0,
        (selected === today ? now.getHours() + now.getMinutes() / 60 - 1 : 8) *
            HOUR_HEIGHT,
    )
    const range = `${parseLocalDateString(monday).getDate()}–${parseLocalDateString(addDays(monday, 6)).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' })}`
    const threeDayRange = `${parseLocalDateString(selected).getDate()}–${parseLocalDateString(addDays(selected, 2)).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' })}`
    const daySubtitle = parseLocalDateString(selected).toLocaleDateString(
        getLocale(),
        { day: 'numeric', month: 'long', year: 'numeric' },
    )
    const modeSubtitle =
        view === 'month'
            ? formatMonthLabel(date)
            : view === 'week'
              ? range
              : view === '3day'
                ? threeDayRange
                : daySubtitle
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
    const threeDayDates = Array.from({ length: 3 }, (_, i) =>
        addDays(selected, i),
    )
    const viewItems: NativeMenuItem[] = (
        ['day', '3day', 'week', 'month'] as ViewMode[]
    ).map((mode) => ({
        key: mode,
        label: VIEW_LABELS[mode],
        systemImage: 'checkmark',
        icon: 'check-outline',
        isActive: mode === view,
        onPress: () => changeView(mode),
    }))
    return (
        <View
            ref={rootRef}
            collapsable={false}
            style={[
                styles.root,
                {
                    backgroundColor: colors.backgroundGrouped.primary,
                    paddingTop: insets.top,
                },
            ]}
        >
            <ScreenGradientBackground />
            <View style={styles.heading}>
                <TheText size="title-1" weight="700">
                    {t('Календарь')}
                </TheText>
                <View style={styles.headerActions}>
                    <TheButtonIcon
                        icon="gear"
                        size="36"
                        view="grouped"
                        accessibilityLabel={t('Настройки')}
                        onPress={() =>
                            router.push({
                                pathname: '/settings',
                                params: { from: 'calendar' },
                            })
                        }
                    />
                    <TheButtonIcon
                        icon={isHeaderExpanded ? 'chevron-up' : 'chevron-down'}
                        size="36"
                        view="grouped"
                        accessibilityLabel={
                            isHeaderExpanded
                                ? t('Свернуть шапку календаря')
                                : t('Развернуть шапку календаря')
                        }
                        onPress={() =>
                            setIsHeaderExpanded((expanded) => !expanded)
                        }
                    />
                </View>
            </View>
            <Collapsible
                visible={isHeaderExpanded}
                testID="calendar-navigation"
            >
                <View style={styles.navigation}>
                    <Pressable
                        disabled={!!draggingItem}
                        accessibilityRole="button"
                        accessibilityLabel={PREV_LABELS[view]}
                        onPress={() => shift(-1)}
                        style={[
                            styles.arrow,
                            { backgroundColor: colors.background.elevated },
                        ]}
                    >
                        <Icon
                            name="chevron-left"
                            size={26}
                            color="labels-primary"
                        />
                    </Pressable>
                    <NativeMenu
                        items={viewItems}
                        trigger={
                            <View
                                testID="calendar-view-switcher"
                                accessibilityRole="button"
                                accessibilityLabel={t(
                                    'Переключить вид календаря',
                                )}
                                style={styles.mode}
                            >
                                <View style={styles.modeTitle}>
                                    <Text style={[styles.modeTitleText, text]}>
                                        {VIEW_LABELS[view]}
                                    </Text>
                                    <Icon
                                        name="chevron-up-down"
                                        size={16}
                                        color="labels-secondary"
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.modeSubtitle,
                                        { color: colors.labels.secondary },
                                    ]}
                                >
                                    {modeSubtitle}
                                </Text>
                            </View>
                        }
                    />
                    <Pressable
                        disabled={!!draggingItem}
                        accessibilityRole="button"
                        accessibilityLabel={NEXT_LABELS[view]}
                        onPress={() => shift(1)}
                        style={[
                            styles.arrow,
                            { backgroundColor: colors.background.elevated },
                        ]}
                    >
                        <Icon
                            name="chevron-right"
                            size={26}
                            color="labels-primary"
                        />
                    </Pressable>
                </View>
            </Collapsible>
            <Collapsible visible={view === 'day'}>
                <View style={styles.weekContainer}>
                    <CalendarPage
                        key={monday}
                        gestureId="calendar-weeks"
                        motion={motion}
                        enabled={!draggingItem}
                        onSwipe={(direction) => shiftWeekStrip(direction)}
                    >
                        <View style={styles.week}>
                            {WEEKDAY_LABELS.map((label, i) => {
                                const key = addDays(monday, i)
                                const active = key === selected
                                return (
                                    <Pressable
                                        key={key}
                                        disabled={!!draggingItem}
                                        accessibilityRole="button"
                                        accessibilityLabel={parseLocalDateString(
                                            key,
                                        ).toLocaleDateString(getLocale())}
                                        accessibilityState={{
                                            selected: active,
                                        }}
                                        onPress={() => chooseDate(key)}
                                        style={[
                                            styles.weekDay,
                                            {
                                                backgroundColor: active
                                                    ? colors.brand
                                                    : 'transparent',
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.weekDayLabel,
                                                {
                                                    color: active
                                                        ? '#fff'
                                                        : colors.labels
                                                              .secondary,
                                                },
                                            ]}
                                        >
                                            {label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.weekDayNumber,
                                                {
                                                    color: active
                                                        ? '#fff'
                                                        : colors.labels.primary,
                                                },
                                            ]}
                                        >
                                            {parseLocalDateString(
                                                key,
                                            ).getDate()}
                                        </Text>
                                        <View
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor:
                                                        key === today
                                                            ? active
                                                                ? '#fff'
                                                                : colors.brand
                                                            : 'transparent',
                                                },
                                            ]}
                                        />
                                    </Pressable>
                                )
                            })}
                        </View>
                    </CalendarPage>
                </View>
            </Collapsible>
            <Collapsible
                visible={
                    unplannedReady &&
                    isHeaderExpanded &&
                    view === 'day' &&
                    unplanned.length > 0
                }
                testID="calendar-unplanned"
            >
                <UnplannedTray
                    items={unplanned}
                    dragging={!!draggingItem}
                    handlers={dragHandlers}
                    onOpen={(item) =>
                        openEditor(draftFromUnplanned(item, selected))
                    }
                />
            </Collapsible>
            <View style={styles.pages}>
                {loading ? (
                    <ActivityIndicator
                        style={styles.loadingIndicator}
                        color={colors.brand}
                    />
                ) : error ? (
                    <View style={styles.error}>
                        <Text style={text}>{error}</Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                                void load().catch(() =>
                                    setError(
                                        t('Не удалось загрузить календарь'),
                                    ),
                                )
                            }
                        >
                            <Text style={{ color: colors.brand }}>
                                {t('Повторить')}
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <CalendarPage
                        gestureId={
                            view === 'month'
                                ? 'calendar-months'
                                : view === 'day'
                                  ? 'calendar-days'
                                  : 'calendar-multiday'
                        }
                        key={
                            view === 'month'
                                ? `month-${selected.slice(0, 7)}`
                                : view === 'day'
                                  ? `day-${selected}`
                                  : view === 'week'
                                    ? `week-${monday}`
                                    : `3day-${selected}`
                        }
                        motion={motion}
                        enabled={!draggingItem}
                        onSwipe={(direction) => shift(direction)}
                    >
                        {view === 'month' ? (
                            <CalendarMonth
                                date={date}
                                today={today}
                                events={events}
                                tasks={tasks}
                                habits={habits}
                                completionState={completionState}
                                settings={settings}
                                onSelect={(next, x, y) =>
                                    changeView('day', next, x, y)
                                }
                            />
                        ) : view === 'day' ? (
                            <CalendarTimeline
                                items={dayItems}
                                date={selected}
                                today={today}
                                now={now}
                                initialOffset={initialOffset}
                                viewportRef={viewportRef}
                                scrollRef={scrollRef}
                                dragging={!!draggingItem}
                                dropMinute={dropMinute}
                                onOffset={onOffset}
                                onMeasure={measure}
                                onOpen={open}
                                onCreate={(minute) =>
                                    openEditor(emptyEvent(selected, minute))
                                }
                            />
                        ) : (
                            <CalendarMultiDayTimeline
                                dates={
                                    view === 'week' ? weekDates : threeDayDates
                                }
                                events={events}
                                tasks={tasks}
                                habits={habits}
                                completionState={completionState}
                                settings={settings}
                                today={today}
                                now={now}
                                onOpen={open}
                                onCreate={(date, minute) =>
                                    openEditor(emptyEvent(date, minute))
                                }
                                onSelectDay={(next, x, y) =>
                                    changeView('day', next, x, y)
                                }
                            />
                        )}
                    </CalendarPage>
                )}
            </View>
            <View
                style={[
                    styles.fab,
                    {
                        bottom:
                            insets.bottom +
                            (Platform.OS === 'android' ? 80 : 16),
                    },
                ]}
            >
                <Pressable
                    disabled={loading || !!error || !!draggingItem}
                    accessibilityRole="button"
                    accessibilityLabel={t('Добавить событие')}
                    onPress={() => openEditor(emptyEvent(selected))}
                    style={({ pressed }) => [
                        styles.add,
                        {
                            backgroundColor: colors.brand,
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                        },
                    ]}
                >
                    <Icon name="plus" size={24} nativeColor="#fff" />
                    <Text style={styles.addLabel}>{t('План')}</Text>
                </Pressable>
            </View>
            {draggingItem && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.ghost,
                        {
                            backgroundColor: colors.background.elevated,
                            borderColor: colors.brand,
                        },
                        ghostStyle,
                    ]}
                >
                    <Text numberOfLines={1} style={[styles.ghostTitle, text]}>
                        {draggingItem.title}
                    </Text>
                    <Text
                        style={[styles.ghostSubtitle, { color: colors.brand }]}
                    >
                        {dropMinute == null
                            ? t('Перенесите на время')
                            : t('{0} · отпустите, чтобы настроить', [
                                  timeLabel(dropMinute),
                              ])}
                    </Text>
                </Animated.View>
            )}
        </View>
    )
}
