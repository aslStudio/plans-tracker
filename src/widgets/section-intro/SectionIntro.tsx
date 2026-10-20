import { t, useLanguage } from '@/shared/lib/i18n'
import { useReducedMotion } from 'react-native-reanimated'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { lottie } from '@/shared/config/lottie'
import { TheLottie } from '@/shared/ui/TheLottie'
import { TheText } from '@/shared/ui/TheText'
import { Icon } from '@/shared/ui/Icon'
import { Placeholder } from '@/shared/ui/Placeholder'
import { TheButton } from '@/shared/ui/TheButton'
import { Card } from '@/shared/ui/Card'

export function SectionIntro({
    section,
    onCreate,
}: {
    section: 'tasks' | 'habits'
    onCreate: () => void
}) {
    useLanguage()

    const reducedMotion = useReducedMotion()
    const tasks = section === 'tasks'
    const features = tasks
        ? [
              {
                  title: t('Планируйте в своём темпе'),
                  text: t(
                      'На сегодня, на завтра или на потом. Дела без даты останутся в бэклоге.',
                  ),
                  target: 'days',
                  action: t('Настроить обзор дней'),
                  animation: lottie['on-boarding'].tasks.card,
              },
              {
                  title: t('Разделяйте и выделяйте'),
                  text: t(
                      'Группы помогут разделить работу и личное, а приоритеты — выбрать главное.',
                  ),
                  target: 'groups',
                  action: t('Настроить группы'),
                  animation: lottie['on-boarding'].tasks.priotiry,
              },
              {
                  title: t('Оставьте рутину приложению'),
                  text: t('Задайте повторение в карточке задачи.'),
                  animation: lottie['on-boarding'].tasks.repeats,
              },
              {
                  title: t('Найдите время для важного'),
                  text: t(
                      'Задавайте начало и длительность, чтобы видеть задачи на шкале календаря.',
                  ),
                  animation: lottie.calendar,
              },
          ]
        : [
              {
                  title: t('Начните с небольшого шага'),
                  text: t(
                      'Читать, гулять или заниматься спортом. Выберите свои дни недели в карточке привычки.',
                  ),
                  animation: lottie['on-boarding'].habits.shedule,
              },
              {
                  title: t('Замечайте свой прогресс'),
                  text: t(
                      'Отмечайте выполнение, собирайте серии и возвращайтесь к истории любого дня.',
                  ),
                  animation: lottie['on-boarding'].habits.streak,
              },
              {
                  title: t('У каждого ритуала своё место'),
                  text: t(
                      'Объединяйте привычки в категории: здоровье, развитие или забота о себе.',
                  ),
                  target: 'categories',
                  action: t('Настроить категории'),
                  animation: lottie['on-boarding'].habits.history,
              },
          ]
    return (
        <View>
            <Placeholder
                size={'medium'}
                title={
                    tasks
                        ? t('Освободите место для главного')
                        : t('Найдите свой ритм')
                }
                description={
                    tasks
                        ? t(
                              'Соберите дела в одном месте. Пусть у каждого будет свой день, а у вас — ясный план.',
                          )
                        : t(
                              'Выберите то, что хочется делать регулярно. Мы поможем увидеть, как старания становятся привычкой.',
                          )
                }
            >
                <TheLottie
                    autoPlay={!reducedMotion}
                    source={tasks ? lottie.pencil : lottie.repeats}
                    style={styles.heroLottie}
                />
            </Placeholder>
            <View style={styles.container}>
                <TheButton style={styles.button} isWide onPress={onCreate}>
                    {t('Начать')}
                </TheButton>
                {features.map((feature) => (
                    <Card key={feature.title} style={[styles.card]}>
                        <View style={styles.featureHeader}>
                            <TheLottie
                                autoPlay={!reducedMotion}
                                source={feature.animation}
                                style={styles.featureAnimation}
                            />
                            <TheText
                                size="body"
                                weight="600"
                                style={styles.flex}
                            >
                                {feature.title}
                            </TheText>
                        </View>
                        <TheText size="subheadline" color="labels-secondary">
                            {feature.text}
                        </TheText>
                        <View>
                            {feature.target && (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() =>
                                        router.push({
                                            pathname: '/settings',
                                            params: {
                                                highlight: feature.target,
                                            },
                                        })
                                    }
                                    style={styles.link}
                                >
                                    <TheText
                                        size="subheadline"
                                        weight="600"
                                        color="brand"
                                    >
                                        {feature.action}
                                    </TheText>
                                    <Icon
                                        name="chevron-right"
                                        size={16}
                                        color="brand"
                                    />
                                </Pressable>
                            )}
                            {feature.target === 'groups' && (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() =>
                                        router.push({
                                            pathname: '/settings',
                                            params: { highlight: 'priority' },
                                        })
                                    }
                                    style={styles.link}
                                >
                                    <TheText
                                        size="subheadline"
                                        weight="600"
                                        color="brand"
                                    >
                                        {t('Настроить приоритеты')}
                                    </TheText>
                                    <Icon
                                        name="chevron-right"
                                        size={16}
                                        color="brand"
                                    />
                                </Pressable>
                            )}
                        </View>
                    </Card>
                ))}

                {Platform.OS === 'ios' && (
                    <Card>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                                router.push({
                                    pathname: '/widget-guide',
                                    params: { section },
                                })
                            }
                            style={[styles.card]}
                        >
                            <View style={styles.featureHeader}>
                                <TheLottie
                                    autoPlay={!reducedMotion}
                                    source={
                                        lottie['on-boarding'].settings.widgets
                                    }
                                    style={styles.featureAnimation}
                                />
                                <TheText
                                    size="body"
                                    weight="600"
                                    style={styles.flex}
                                >
                                    {t('Прогресс на главном экране')}
                                </TheText>
                            </View>
                            <TheText
                                size="subheadline"
                                color="labels-secondary"
                            >
                                {tasks
                                    ? t(
                                          'Следите за делами и отмечайте выполненное прямо в виджете.',
                                      )
                                    : t(
                                          'Видьте серию и отмечайте привычки, не открывая приложение.',
                                      )}
                            </TheText>
                            <View style={styles.link}>
                                <TheText
                                    size="subheadline"
                                    weight="600"
                                    color="brand"
                                >
                                    {t('Выбрать виджет')}
                                </TheText>
                                <Icon
                                    name="chevron-right"
                                    size={16}
                                    color="brand"
                                />
                            </View>
                        </Pressable>
                    </Card>
                )}
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 10,
    },
    heroLottie: {
        width: 112,
        height: 112,
    },
    button: {
        marginBottom: 16,
    },
    card: { padding: 16 },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    featureAnimation: { width: 48, height: 48 },
    flex: { flex: 1 },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44,
        gap: 4,
    },
})
