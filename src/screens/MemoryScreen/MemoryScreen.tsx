import { t, getLocale, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import {
    SafeAreaInsetsContext,
    SafeAreaProvider,
} from 'react-native-safe-area-context'
import Animated, {
    FadeIn,
    FadeInDown,
    ReduceMotion,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/lib/theme/use-theme'
import {
    cleanMemory,
    cloudStatus,
    memoryUsage,
    MemoryUserError,
    syncMemory,
    updateMemorySettings,
    type SyncInterval,
} from '@/shared/lib/memory/service'
import { formatBytes } from '@/shared/lib/memory/retention'
import { AppHeader } from '@/shared/ui/AppHeader'
import { TheText } from '@/shared/ui/TheText'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheLottie } from '@/shared/ui/TheLottie'
import { Placeholder } from '@/shared/ui/Placeholder'
import { Section } from '@/shared/ui/Section'
import { Row } from '@/shared/ui/Row'
import { Separator } from '@/shared/ui/Separator'
import { PropertyRow } from '@/shared/ui/PropertyRow'
import { DeleteConfirmationSheet } from '@/shared/ui/DeleteConfirmationSheet'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import type { Color } from '@/shared/config/color'
import { resolveTextColor } from '@/shared/ui/TheText/model'
import { useStyles } from './styles'

const intervals: Record<SyncInterval, string> = {
    get day() {
        return t('Раз в день')
    },
    get week() {
        return t('Раз в неделю')
    },
    get month() {
        return t('Раз в месяц')
    },
}
type Operation = {
    busy: boolean
    title: string
    description: string
    error?: boolean
}
export function MemoryScreen({
    onClose,
    onBusyChange,
}: {
    onClose: () => void
    onBusyChange: (busy: boolean) => void
}) {
    const language = useLanguage()

    const { colors, colorScheme } = useTheme()
    const styles = useStyles()
    const [usage, setUsage] =
        useState<Awaited<ReturnType<typeof memoryUsage>>>()
    const [status, setStatus] = useState({
        available: false,
        message: t('Проверяем доступность iCloud…'),
    })
    const [confirm, setConfirm] = useState<'all' | 'old' | null>(null)
    const [operation, setOperation] = useState<Operation | null>(null)
    const [error, setError] = useState<string>()
    const [syncing, setSyncing] = useState(false)
    const busyRef = useRef(false)
    const refresh = useCallback(async () => {
        // Recompute localized values when the app language changes.
        void language

        setUsage(await memoryUsage())
        setStatus(await cloudStatus())
    }, [language])
    useEffect(() => {
        let active = true
        void Promise.all([memoryUsage(), cloudStatus()])
            .then(([nextUsage, nextStatus]) => {
                if (active) {
                    setUsage(nextUsage)
                    setStatus(nextStatus)
                }
            })
            .catch((e) => {
                if (active) setError(String(e))
            })
        return () => {
            active = false
        }
    }, [])
    async function synchronize() {
        if (busyRef.current) return
        busyRef.current = true
        setSyncing(true)
        setError(undefined)
        onBusyChange(true)
        try {
            await updateMemorySettings({ enabled: true })
            await syncMemory(true)
            await refresh()
        } catch (e) {
            setError(
                e instanceof MemoryUserError
                    ? e.message
                    : t('Что-то пошло не так'),
            )
        } finally {
            busyRef.current = false
            setSyncing(false)
            onBusyChange(false)
        }
    }
    async function cleanup(mode: 'all' | 'old') {
        if (busyRef.current) return
        busyRef.current = true
        setConfirm(null)
        onBusyChange(true)
        setOperation({
            busy: true,
            title: t('Идёт удаление данных'),
            description: t('Пожалуйста, не закрывайте приложение'),
        })
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        )
        try {
            const result = await cleanMemory(mode, (description) =>
                setOperation({
                    busy: true,
                    title: t('Идёт удаление данных'),
                    description,
                }),
            )
            setOperation({
                busy: false,
                title: t('Память очищена'),
                description: t(
                    'Удалено записей: {0}. Ваша серия сохранена.{1}',
                    [
                        result.removed,
                        result.cloudPending
                            ? ' ' +
                              t(
                                  'Очистка iCloud завершится при следующей успешной синхронизации.',
                              ) +
                              ''
                            : '',
                    ],
                ),
            })
            await refresh()
        } catch (e) {
            setOperation({
                busy: false,
                error: true,
                title: t('Не удалось завершить очистку'),
                description:
                    e instanceof MemoryUserError
                        ? e.message
                        : t('Что-то пошло не так'),
            })
        } finally {
            busyRef.current = false
            onBusyChange(false)
        }
    }
    return (
        <View style={styles.container}>
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={<TheText weight="600">{t('Память')}</TheText>}
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        view="grouped"
                        accessibilityLabel={t('Закрыть память')}
                        onPress={() => {
                            if (!busyRef.current) onClose()
                        }}
                    />
                }
            />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {!usage ? (
                    <ActivityIndicator
                        style={styles.loadingIndicator}
                        color={colors.brand}
                    />
                ) : (
                    <>
                        <Section>
                            <View style={styles.usage}>
                                <TheText
                                    color="labels-secondary"
                                    size="subheadline"
                                >
                                    {t('Данные на устройстве')}
                                </TheText>
                                <TheText
                                    size="amount"
                                    weight="700"
                                    font="rounded"
                                >
                                    {formatBytes(usage.localBytes)}
                                </TheText>
                                <View style={styles.bar}>
                                    {usage.groups
                                        .filter((group) => group.bytes > 0)
                                        .map((group) => (
                                            <View
                                                key={group.label}
                                                style={{
                                                    flex: group.bytes,
                                                    backgroundColor:
                                                        resolveTextColor(
                                                            colors,
                                                            group.color as Color,
                                                        ),
                                                }}
                                            />
                                        ))}
                                </View>
                                <View style={styles.cloud}>
                                    <TheText color="labels-secondary">
                                        {t('В iCloud')}
                                    </TheText>
                                    <TheText weight="600">
                                        {usage.settings.cloudBytes === undefined
                                            ? '—'
                                            : formatBytes(
                                                  usage.settings.cloudBytes,
                                              )}
                                    </TheText>
                                </View>
                                <TheText
                                    color="labels-tertiary"
                                    size="footnote"
                                >
                                    {t(
                                        'Объём сохранённых данных приложения. Размер самого приложения и системных файлов сюда не входит. Для iCloud — объём последнего подтверждённого архива.',
                                    )}
                                </TheText>
                            </View>
                        </Section>
                        <Section>
                            {usage.groups.map((group, i) => (
                                <View key={group.label}>
                                    {i > 0 && <Separator offsetLeft={16} />}
                                    <Row
                                        label={group.label}
                                        icon={
                                            <View
                                                style={[
                                                    styles.groupDot,
                                                    {
                                                        backgroundColor:
                                                            resolveTextColor(
                                                                colors,
                                                                group.color as Color,
                                                            ),
                                                    },
                                                ]}
                                            />
                                        }
                                        RightElement={
                                            <TheText
                                                color="labels-secondary"
                                                size="subheadline"
                                            >
                                                {formatBytes(group.bytes)}
                                            </TheText>
                                        }
                                    />
                                </View>
                            ))}
                        </Section>
                        <Section
                            TopElement={
                                <TheText
                                    style={styles.heading}
                                    weight="600"
                                    size="subheadline"
                                >
                                    {t('Синхронизация с iCloud')}
                                </TheText>
                            }
                        >
                            <PropertyRow
                                label={t('Периодичность')}
                                valueLabel={intervals[usage.settings.interval]}
                                items={(
                                    Object.keys(intervals) as SyncInterval[]
                                ).map((interval) => ({
                                    key: interval,
                                    label: intervals[interval],
                                    isActive:
                                        usage.settings.interval === interval,
                                    onPress: () => {
                                        void updateMemorySettings({ interval })
                                            .then((settings) => {
                                                setUsage((current) =>
                                                    current
                                                        ? {
                                                              ...current,
                                                              settings,
                                                          }
                                                        : current,
                                                )
                                            })
                                            .catch((e) => setError(String(e)))
                                    },
                                }))}
                            />
                            <Separator offsetLeft={16} />
                            <View style={styles.note}>
                                <TheText
                                    size="subheadline"
                                    color="labels-secondary"
                                >
                                    {status.message}
                                </TheText>
                                <TheText
                                    size="footnote"
                                    color="labels-tertiary"
                                >
                                    {usage.settings.lastSync
                                        ? t('Последняя синхронизация: {0}', [
                                              new Date(
                                                  usage.settings.lastSync,
                                              ).toLocaleString(getLocale()),
                                          ])
                                        : t('Синхронизация ещё не выполнялась')}
                                </TheText>
                                <TheText
                                    size="footnote"
                                    color="labels-secondary"
                                >
                                    {t(
                                        'После сохранения в iCloud завершённые задачи и прошедшие планы старше',
                                    )}{' '}
                                    {usage.settings.interval === 'day'
                                        ? t('одного дня')
                                        : usage.settings.interval === 'week'
                                          ? t('недели')
                                          : t('месяца')}{' '}
                                    {t(
                                        'остаются только в облаке. Для их просмотра нужен интернет. Активные задачи, привычки и их отметки остаются на устройстве.',
                                    )}
                                </TheText>
                                <TheText
                                    size="footnote"
                                    color="labels-tertiary"
                                >
                                    {t(
                                        'Проверяем срок при открытии приложения. iOS не гарантирует запуск в точное время.',
                                    )}
                                </TheText>
                                <TheButton
                                    size="44"
                                    isWide
                                    isLoading={syncing}
                                    isDisabled={!status.available || syncing}
                                    onPress={() => {
                                        void synchronize()
                                    }}
                                >
                                    {usage.settings.enabled
                                        ? t('Синхронизировать сейчас')
                                        : t('Подключить iCloud')}
                                </TheButton>
                            </View>
                        </Section>
                        <Section
                            TopElement={
                                <TheText
                                    style={styles.heading}
                                    weight="600"
                                    size="subheadline"
                                >
                                    {t('Освободить место')}
                                </TheText>
                            }
                        >
                            <Row
                                label={t('Очистить старше месяца')}
                                description={t(
                                    'Завершённые задачи, прошедшие планы и история отметок',
                                )}
                                onPress={() => {
                                    if (!busyRef.current) setConfirm('old')
                                }}
                            />
                            <Separator offsetLeft={16} />
                            <Row
                                label={t('Очистить все данные')}
                                labelColor="accent-red"
                                description={t(
                                    'Задачи, привычки, планы и логи',
                                )}
                                onPress={() => {
                                    if (!busyRef.current) setConfirm('all')
                                }}
                            />
                        </Section>
                        <TheText
                            style={styles.footer}
                            size="footnote"
                            color="labels-secondary"
                        >
                            {t(
                                'Число серии и отметки об удалённой истории хранятся отдельно и сохраняются при очистке. Настройки приложения также останутся.',
                            )}
                        </TheText>
                    </>
                )}
                {error && (
                    <TheText
                        style={styles.footer}
                        color="accent-red"
                        size="footnote"
                    >
                        {error}
                    </TheText>
                )}
            </ScrollView>
            <DeleteConfirmationSheet
                visible={confirm !== null}
                title={
                    confirm === 'all'
                        ? t('Очистить все данные?')
                        : t('Удалить историю старше месяца?')
                }
                description={
                    confirm === 'all'
                        ? t(
                              'Будут удалены задачи, привычки, планы, отметки и логи, включая архив iCloud при следующей синхронизации. Число серии и настройки останутся. Восстановить удалённые данные нельзя.',
                          )
                        : t(
                              'Будут удалены завершённые задачи, прошедшие планы и отметки выполнения старше месяца, включая архив iCloud. Незавершённые задачи и действующие повторения останутся. Число серии сохранится, но подробности удалённых дней восстановить нельзя.',
                          )
                }
                confirmLabel={t('Очистить')}
                onCancel={() => setConfirm(null)}
                onConfirm={() => {
                    if (confirm) void cleanup(confirm)
                }}
            />
            <Modal
                visible={operation !== null}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    if (!operation?.busy) setOperation(null)
                }}
            >
                <SafeAreaProvider>
                    <BlurView
                        intensity={40}
                        tint={colorScheme === 'dark' ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={[StyleSheet.absoluteFill, styles.modalTint]} />
                    <SafeAreaInsetsContext.Consumer>
                        {(modalInsets) => (
                            <View
                                style={[
                                    styles.modalContent,
                                    {
                                        paddingTop: modalInsets?.top ?? 0,
                                        paddingBottom:
                                            (modalInsets?.bottom ?? 0) + 8,
                                    },
                                ]}
                            >
                                <View style={styles.modalCenter}>
                                    <Animated.View
                                        entering={FadeInDown.duration(
                                            350,
                                        ).reduceMotion(ReduceMotion.System)}
                                        style={[
                                            styles.response,
                                            {
                                                backgroundColor:
                                                    colors.background.elevated,
                                            },
                                        ]}
                                    >
                                        <Placeholder
                                            title={operation?.title ?? ''}
                                            description={operation?.description}
                                        >
                                            <TheLottie
                                                source={
                                                    operation?.busy
                                                        ? lottie.delete
                                                        : operation?.error
                                                          ? lottie.warning
                                                          : lottie.done
                                                }
                                                style={styles.operationLottie}
                                            />
                                        </Placeholder>
                                    </Animated.View>
                                </View>
                                <Animated.View entering={FadeIn.duration(250)}>
                                    <TheButton
                                        isWide
                                        isDisabled={operation?.busy}
                                        isLoading={operation?.busy}
                                        onPress={() => setOperation(null)}
                                    >
                                        {operation?.busy
                                            ? t('Удаляем данные…')
                                            : t('Понятно')}
                                    </TheButton>
                                </Animated.View>
                            </View>
                        )}
                    </SafeAreaInsetsContext.Consumer>
                </SafeAreaProvider>
            </Modal>
        </View>
    )
}
