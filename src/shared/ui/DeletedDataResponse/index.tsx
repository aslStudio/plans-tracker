import { t, useLanguage } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { Placeholder } from '@/shared/ui/Placeholder'
import { TheLottie } from '@/shared/ui/TheLottie'
import { AppHeader } from '@/shared/ui/AppHeader'
import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'
import { useStyles } from './styles'

export function DeletedDataResponse({
    fullScreen = false,
    missing = false,
}: {
    fullScreen?: boolean
    missing?: boolean
}) {
    useLanguage()

    const router = useRouter()
    const styles = useStyles()
    const content = (
        <Placeholder
            title={
                missing ? t('Данные недоступны') : t('Эти данные были удалены')
            }
            description={
                missing
                    ? t(
                          'Запись не найдена на устройстве. Если она хранится в iCloud, подключитесь к интернету и синхронизируйте данные в настройках памяти.',
                      )
                    : t(
                          'Вы удалили их при очистке памяти. Подробности восстановить нельзя, но число серии сохранено.',
                      )
            }
        >
            <TheLottie source={lottie.delete} style={styles.lottie} />
        </Placeholder>
    )
    if (!fullScreen) return content
    return (
        <View style={styles.container}>
            <AppHeader
                isModal
                CenterItem={<TheText weight="600">{t('Данные')}</TheText>}
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
            <View style={styles.center}>{content}</View>
        </View>
    )
}
