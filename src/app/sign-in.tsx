import * as AppleAuthentication from 'expo-apple-authentication'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    signInWithApple,
    signOut,
    deleteAccount,
    useAuthState,
} from '@/shared/lib/auth/session'
import { lottie } from '@/shared/config/lottie'
import { t, useLanguage } from '@/shared/lib/i18n'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { showAppToast } from '@/shared/lib/toast/app-toast'
import { ScreenGradientBackground } from '@/shared/ui/ScreenGradientBackground'
import { AppHeader } from '@/shared/ui/AppHeader'
import { TheButton } from '@/shared/ui/TheButton'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'
import { resetAppState, returnToFirstLaunch } from '@/shared/lib/dev/reset-app-state'

export default function SignInScreen() {
    useLanguage()
    const router = useRouter()
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()
    const auth = useAuthState()
    const [available, setAvailable] = useState(false)
    const [availabilityChecked, setAvailabilityChecked] = useState(
        Platform.OS !== 'ios',
    )
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (Platform.OS !== 'ios') return
        void AppleAuthentication.isAvailableAsync()
            .then(setAvailable)
            .catch(() => setAvailable(false))
            .finally(() => setAvailabilityChecked(true))
    }, [])

    async function authenticate() {
        if (busy) return
        setBusy(true)
        try {
            await signInWithApple()
            router.back()
        } catch (cause) {
            if ((cause as { code?: string })?.code !== 'ERR_REQUEST_CANCELED')
                showAppToast({
                    title: t('Не удалось войти'),
                    description: t('Проверьте сеть и попробуйте ещё раз.'),
                    animation: 'warning',
                })
        } finally {
            setBusy(false)
        }
    }

    function leaveAccount() {
        Alert.alert(
            t('Выйти из аккаунта?'),
            t(
                'Данные останутся на устройстве. Синхронизация остановится до следующего входа.',
            ),
            [
                { text: t('Отмена'), style: 'cancel' },
                {
                    text: t('Выйти'),
                    onPress: () => {
                        void signOut().then(() => router.back())
                    },
                },
            ],
        )
    }

    function confirmDeleteAccount() {
        if (busy) return
        Alert.alert(
            t('Удалить аккаунт?'),
            t('Аккаунт и все связанные с ним данные на сервере и этом устройстве будут удалены без возможности восстановления.'),
            [
                { text: t('Отмена'), style: 'cancel' },
                {
                    text: t('Удалить аккаунт'),
                    style: 'destructive',
                    onPress: () => void removeAccount(),
                },
            ],
        )
    }

    async function removeAccount() {
        if (busy) return
        setBusy(true)
        try {
            await deleteAccount()
        } catch {
            Alert.alert(
                t('Не удалось удалить аккаунт'),
                t('Проверьте сеть и попробуйте ещё раз. Если удаление уже началось, повторите попытку позже.'),
            )
            setBusy(false)
            return
        }
        try {
            await resetAppState()
            Alert.alert(
                t('Аккаунт удалён'),
                t('Аккаунт и данные удалены. Приложение вернётся к первому запуску.'),
                [{ text: t('Понятно'), onPress: returnToFirstLaunch }],
            )
        } catch {
            Alert.alert(
                t('Аккаунт удалён'),
                t('Серверные данные удалены, но не удалось очистить данные на устройстве. Очистите данные приложения перед новым входом.'),
            )
            setBusy(false)
        }
    }

    return (
        <View
            style={[
                styles.root,
                { backgroundColor: colors.background.primary },
            ]}
        >
            <ScreenGradientBackground />
            <AppHeader
                isModal
                CenterItem={<TheText weight="600">{t('Аккаунт')}</TheText>}
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        view="grouped"
                        accessibilityLabel={t('Закрыть')}
                        onPress={() => router.back()}
                    />
                }
            />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    <TheLottie
                        source={lottie.calendar}
                        loop={false}
                        style={styles.calendar}
                        accessibilityLabel={t('Анимированный календарь')}
                    />
                    <View style={styles.intro}>
                        <TheText size="title-2" weight="700" align="center">
                            {auth.session
                                ? t('Планы всегда с вами')
                                : t('Планы всегда под рукой')}
                        </TheText>
                        <TheText color="labels-secondary" align="center">
                            {auth.session
                                ? (auth.session.user.display_name ??
                                  auth.session.user.email ??
                                  t('Apple ID'))
                                : t(
                                      'Войдите через Apple, чтобы сохранять изменения и продолжать планировать на другом устройстве.',
                                  )}
                        </TheText>
                    </View>
                </View>
            </ScrollView>
            <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
                <View style={styles.actions}>
                    {auth.session ? (
                        <>
                            <TheButton size="44" isWide isDisabled={busy} onPress={leaveAccount}>
                                {t('Выйти')}
                            </TheButton>
                            <TheButton
                                size="44"
                                variant="plain"
                                view="destructive"
                                isWide
                                isLoading={busy}
                                onPress={confirmDeleteAccount}
                            >
                                {t('Удалить аккаунт')}
                            </TheButton>
                        </>
                    ) : (
                        <>
                            {available && (
                                <TheButton
                                    size="52"
                                    variant="primary"
                                    view="brand"
                                    iconLeft="apple.logo"
                                    iconSize={24}
                                    isWide
                                    isLoading={busy}
                                    onPress={() => void authenticate()}
                                >
                                    {t('Войти через Apple')}
                                </TheButton>
                            )}
                            {availabilityChecked && !available && (
                                <TheText
                                    color="labels-secondary"
                                    align="center"
                                >
                                    {t(
                                        'Вход через Apple доступен в приложении для iPhone.',
                                    )}
                                </TheText>
                            )}
                            <TheButton
                                size="52"
                                variant="secondary"
                                view="brand"
                                isWide
                                isDisabled={busy}
                                onPress={() => router.back()}
                            >
                                {t('Продолжить без входа')}
                            </TheButton>
                        </>
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    content: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        alignItems: 'center',
        gap: 20,
    },
    calendar: { width: 176, height: 176 },
    intro: { alignItems: 'center', gap: 10 },
    footer: { paddingHorizontal: 24, paddingTop: 16 },
    actions: { width: '100%', alignItems: 'center', gap: 14 },
})
