import { localizedLabels, t, useLanguage } from '@/shared/lib/i18n'
import { useEffect, useRef, useState } from 'react'
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    type SharedValue,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { AppHeader, getAppHeaderHeight } from '@/shared/ui/AppHeader'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { TheText } from '@/shared/ui/TheText'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'

const sizes = localizedLabels(['Большой', 'Средний', 'Маленький'])
const AUTOPLAY_INTERVAL_MS = 3500

export function WidgetGuideScreen() {
    useLanguage()

    const { section } = useLocalSearchParams<{ section?: string }>()
    const kind = section === 'habits' ? 'habits' : 'tasks'
    const tasks = kind === 'tasks'
    const router = useRouter()
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()
    const { width } = useWindowDimensions()
    const reducedMotion = useReducedMotion()
    const pager = useRef<ScrollView>(null)
    const [page, setPage] = useState(0)
    const widgetWidth = Math.min(width - 56, 340)
    const scrollX = useSharedValue(0)
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.set(event.contentOffset.x)
        },
    })
    const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null)
    function stopAutoplay() {
        if (autoplayTimer.current) {
            clearInterval(autoplayTimer.current)
            autoplayTimer.current = null
        }
    }
    function startAutoplay() {
        stopAutoplay()
        if (reducedMotion) return
        autoplayTimer.current = setInterval(() => {
            setPage((current) => {
                const next = (current + 1) % sizes.length
                pager.current?.scrollTo({ x: next * width, animated: true })
                return next
            })
        }, AUTOPLAY_INTERVAL_MS)
    }
    useEffect(() => {
        startAutoplay()
        return stopAutoplay
        // eslint-disable-next-line react-hooks/exhaustive-deps -- startAutoplay/stopAutoplay are recreated every render; only reducedMotion/width should restart the timer.
    }, [reducedMotion, width])
    const close = () =>
        router.canGoBack() ? router.back() : router.replace('/')
    return (
        <View
            style={[
                styles.screen,
                { backgroundColor: colors.backgroundGrouped.primary },
            ]}
        >
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={
                    <TheText weight="600">
                        {t('Виджеты · {0}', [
                            tasks ? t('Задачи') : t('Привычки'),
                        ])}
                    </TheText>
                }
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        view="grouped"
                        accessibilityLabel={t('Закрыть')}
                        onPress={close}
                    />
                }
            />
            <ScrollView
                contentContainerStyle={{
                    paddingTop: getAppHeaderHeight(true, insets.top) + 0,
                    paddingBottom: insets.bottom + 32,
                }}
            >
                <Animated.ScrollView
                    key={width}
                    ref={pager}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentOffset={{ x: page * width, y: 0 }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={stopAutoplay}
                    onMomentumScrollEnd={(event) => {
                        setPage(
                            Math.max(
                                0,
                                Math.min(
                                    2,
                                    Math.round(
                                        event.nativeEvent.contentOffset.x /
                                            width,
                                    ),
                                ),
                            ),
                        )
                        startAutoplay()
                    }}
                >
                    {sizes.map((size, index) => (
                        <View key={size} style={[styles.page, { width }]}>
                            <View style={styles.previewStage}>
                                <WidgetPreview
                                    kind={kind}
                                    size={index}
                                    width={widgetWidth}
                                />
                            </View>
                        </View>
                    ))}
                </Animated.ScrollView>
                <View style={styles.pagination}>
                    {sizes.map((size, index) => (
                        <Pressable
                            key={size}
                            accessibilityRole="button"
                            accessibilityLabel={t('{0} виджет', [size])}
                            accessibilityState={{ selected: page === index }}
                            onPress={() => {
                                stopAutoplay()
                                setPage(index)
                                pager.current?.scrollTo({
                                    x: index * width,
                                    animated: !reducedMotion,
                                })
                                startAutoplay()
                            }}
                            style={styles.dotButton}
                        >
                            <PaginationDot
                                index={index}
                                pageWidth={width}
                                scrollX={scrollX}
                            />
                        </Pressable>
                    ))}
                </View>
                <View
                    style={[
                        styles.instructions,
                        { backgroundColor: colors.backgroundGrouped.secondary },
                    ]}
                >
                    <TheText size="title-3" weight="700">
                        {t('Как добавить на iPhone')}
                    </TheText>
                    {(Platform.OS === 'ios'
                        ? [
                              [
                                  t('Откройте главный экран'),
                                  t(
                                      'Зажмите свободное место, пока значки не начнут покачиваться.',
                                  ),
                              ],
                              [
                                  t('Найдите Plans Tracker'),
                                  t(
                                      'Нажмите «Изменить» → «Добавить виджет» (или «+» в более ранней iOS) и найдите приложение.',
                                  ),
                              ],
                              [
                                  t('Выберите свой вариант'),
                                  t(
                                      'Найдите «{0}», пролистайте размеры и нажмите «Добавить виджет».',
                                      [tasks ? t('Задачи') : t('Привычки')],
                                  ),
                              ],
                              [
                                  t('Готово — он рядом'),
                                  t(
                                      'Разместите виджет в удобном месте и нажмите «Готово». Данные появятся после добавления дел в приложении.',
                                  ),
                              ],
                          ]
                        : [
                              [
                                  t('Доступно на iPhone'),
                                  t(
                                      'Эти виджеты предназначены для iOS. На этой платформе их установить нельзя.',
                                  ),
                              ],
                          ]
                    ).map(([title, text], index) => (
                        <View key={title} style={styles.step}>
                            <View
                                style={[
                                    styles.stepNumber,
                                    { backgroundColor: colors.brandSecondary },
                                ]}
                            >
                                <TheText color="brand" weight="700">
                                    {index + 1}
                                </TheText>
                            </View>
                            <View style={styles.stepCopy}>
                                <TheText weight="600">{title}</TheText>
                                <TheText
                                    size="subheadline"
                                    color="labels-secondary"
                                >
                                    {text}
                                </TheText>
                            </View>
                        </View>
                    ))}
                </View>
                <TheText
                    style={styles.footer}
                    size="footnote"
                    color="labels-secondary"
                    align="center"
                >
                    {t(
                        'Виджет добавляется через меню iOS. Для отметок выполнения нужен большой виджет и iOS 17 или новее.',
                    )}
                </TheText>
            </ScrollView>
        </View>
    )
}

/** A pagination dot that continuously widens/recolors as the pager scrolls past it, instead of just snapping at the end of the swipe — same technique as `OnboardingPagination`. */
function PaginationDot({
    index,
    pageWidth,
    scrollX,
}: {
    index: number
    pageWidth: number
    scrollX: SharedValue<number>
}) {
    const { colors } = useTheme()
    const inputRange = [
        (index - 1) * pageWidth,
        index * pageWidth,
        (index + 1) * pageWidth,
    ]
    const style = useAnimatedStyle(() => {
        const progress = scrollX.get()
        return {
            width: interpolate(
                progress,
                inputRange,
                [7, 22, 7],
                Extrapolation.CLAMP,
            ),
            backgroundColor: interpolateColor(progress, inputRange, [
                colors.labels.tertiary,
                colors.brand,
                colors.labels.tertiary,
            ]),
        }
    })

    return <Animated.View style={[styles.dot, style]} />
}

function WidgetPreview({
    kind,
    size,
    width,
}: {
    kind: 'tasks' | 'habits'
    size: number
    width: number
}) {
    useLanguage()

    const { colors } = useTheme()
    const tasks = kind === 'tasks'
    const small = size === 2
    const large = size === 0
    const accent = colors.accent.orange
    const items = tasks
        ? [
              t('Разобрать почту'),
              t('Забрать заказ'),
              t('Подготовить презентацию'),
              t('Записаться к врачу'),
              t('Спланировать выходные'),
          ]
        : [
              t('Выпить воду'),
              t('Почитать 20 минут'),
              t('Прогулка'),
              t('Зарядка'),
              t('Сходить в зал'),
          ]
    return (
        <View
            pointerEvents="none"
            style={[
                styles.widget,
                {
                    backgroundColor: colors.backgroundGrouped.secondary,
                    width: small ? 164 : width,
                    minHeight: large ? 300 : 164,
                    flexDirection: size === 1 ? 'row' : 'column',
                    ...(!small &&
                        !large && {
                            alignItems: 'center',
                        }),
                },
            ]}
        >
            {large ? (
                <>
                    <View style={styles.widgetHeader}>
                        <TheText size="subheadline" weight="600">
                            {tasks ? t('Задачи · сегодня') : t('Привычки')}
                        </TheText>
                        <TheText size="caption-1" color="labels-secondary">
                            2/{items.length}
                        </TheText>
                    </View>
                    <View
                        style={[
                            styles.bar,
                            { backgroundColor: colors.fill.tertiary },
                        ]}
                    >
                        <View
                            style={{
                                width: tasks ? '40%' : '50%',
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: accent,
                            }}
                        />
                    </View>
                    {items.map((item, index) => (
                        <View style={styles.widgetRow} key={item}>
                            <View
                                style={[
                                    styles.check,
                                    {
                                        borderColor:
                                            index < 2
                                                ? accent
                                                : colors.labels.tertiary,
                                        backgroundColor:
                                            index < 2 ? accent : 'transparent',
                                    },
                                ]}
                            >
                                <TheText
                                    size="caption-2"
                                    style={{ color: '#fff' }}
                                >
                                    {index < 2 ? '✓' : ''}
                                </TheText>
                            </View>
                            <TheText
                                size="subheadline"
                                numberOfLines={1}
                                style={{
                                    flex: 1,
                                    textDecorationLine:
                                        index < 2 && tasks
                                            ? 'line-through'
                                            : 'none',
                                }}
                                color={
                                    index < 2
                                        ? 'labels-secondary'
                                        : 'labels-primary'
                                }
                            >
                                {item}
                            </TheText>
                        </View>
                    ))}
                    {tasks && (
                        <TheText
                            size="footnote"
                            weight="600"
                            style={{ color: accent, marginTop: 8 }}
                        >
                            {t('＋ Добавить задачу')}
                        </TheText>
                    )}
                </>
            ) : (
                <>
                    <View style={styles.ring}>
                        <Svg width={86} height={86} viewBox="0 0 86 86">
                            <Circle
                                cx={43}
                                cy={43}
                                r={36}
                                fill="none"
                                stroke={colors.fill.tertiary}
                                strokeWidth={7}
                            />
                            <Circle
                                cx={43}
                                cy={43}
                                r={36}
                                fill="none"
                                stroke={accent}
                                strokeWidth={7}
                                strokeDasharray={`${226 * (tasks ? 0.4 : 0.5)} 226`}
                                strokeLinecap="round"
                                rotation={-90}
                                origin="43, 43"
                            />
                        </Svg>
                        <View style={styles.ringLabel}>
                            <TheText size="title-2" weight="700">
                                40%
                            </TheText>
                        </View>
                    </View>
                    <View style={{ gap: 7, flex: 1 }}>
                        <TheText
                            size={small ? 'caption-1' : 'subheadline'}
                            weight="600"
                        >
                            {tasks ? t('Задачи · сегодня') : t('5 дней подряд')}
                        </TheText>
                        {(!small || tasks) && (
                            <TheText size="caption-1" color="labels-secondary">
                                {t('2 из {0} выполнено', [tasks ? 5 : 4])}
                            </TheText>
                        )}
                        {tasks && !small && (
                            <TheText
                                size="footnote"
                                weight="600"
                                style={{ color: accent }}
                            >
                                {t('＋ Добавить задачу')}
                            </TheText>
                        )}
                    </View>
                </>
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    intro: { paddingHorizontal: 28, gap: 10 },
    page: { paddingHorizontal: 28, gap: 10 },
    previewStage: {
        minHeight: 344,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    widget: {
        padding: 18,
        borderRadius: 26,
        gap: 12,
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        borderCurve: 'continuous',
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    ring: { width: 86, height: 86 },
    ringLabel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bar: { height: 6, borderRadius: 3, marginBottom: 6 },
    widgetRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        minHeight: 28,
    },
    check: {
        width: 21,
        height: 21,
        borderWidth: 1.5,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dotButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: { height: 7, borderRadius: 4 },
    instructions: {
        margin: 16,
        marginTop: 28,
        padding: 22,
        borderRadius: 24,
        gap: 22,
    },
    step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCopy: { flex: 1 },
    footer: { paddingHorizontal: 28 },
})
