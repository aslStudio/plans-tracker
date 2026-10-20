import { t } from '@/shared/lib/i18n'
import { lottie } from '@/shared/config/lottie'
import type { OnboardingSlideData } from './model'

/**
 * Each slide reuses an existing in-app animation as a stand-in for its
 * topic (and its own features reuse that same one) — swap any `animation`
 * field individually once a dedicated onboarding `.tgs` asset exists for
 * it, no structural change needed.
 */
export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
    {
        key: 'tasks',
        animation: lottie.pencil,
        get title() {
            return t('Задачи под контролем, а не в хаосе')
        },
        get description() {
            return t(
                'Сегодня, завтра, бэклог и просроченные — всё раскладывается по своим местам само.',
            )
        },
        features: [
            {
                get title() {
                    return t('Карточки дня')
                },
                get description() {
                    return t(
                        'Задачи сами группируются на сегодня, завтра и бэклог — сортировка и фильтр по группам под рукой',
                    )
                },
                animation: lottie['on-boarding'].tasks.card,
            },
            {
                get title() {
                    return t('Повторяющиеся задачи')
                },
                get description() {
                    return t(
                        'Каждый день, по дням недели или со своим интервалом — Plans Tracker сам подставит нужные даты',
                    )
                },
                animation: lottie['on-boarding'].tasks.repeats,
            },
            {
                get title() {
                    return t('Свои статусы и приоритеты')
                },
                get description() {
                    return t(
                        'Не только «готово» — заведите собственные статусы, приоритеты и группы под свой процесс',
                    )
                },
                animation: lottie['on-boarding'].tasks.priotiry,
            },
        ],
    },
    {
        key: 'habits',
        animation: lottie.repeats,
        get title() {
            return t('Привычки, которые держат ритм')
        },
        get description() {
            return t(
                'Отмечайте выполнение одним касанием и смотрите, как день за днём растёт серия.',
            )
        },
        features: [
            {
                get title() {
                    return t('Гибкое расписание')
                },
                get description() {
                    return t(
                        'Каждый день, по будням или в свои дни недели — привычка подстраивается под вашу неделю',
                    )
                },
                animation: lottie['on-boarding'].habits.shedule,
            },
            {
                get title() {
                    return t('Серия и графики')
                },
                get description() {
                    return t(
                        'Общая серия по всем привычкам и график за неделю показывают прогресс наглядно',
                    )
                },
                animation: lottie['on-boarding'].habits.streak,
            },
            {
                get title() {
                    return t('История за весь месяц')
                },
                get description() {
                    return t(
                        'Откройте любой день в календаре привычек — посмотрите прогресс или отметьте выполнение задним числом',
                    )
                },
                animation: lottie['on-boarding'].habits.history,
            },
        ],
    },
    {
        key: 'calendar',
        animation: lottie.calendar,
        get title() {
            return t('Календарь, который видит всё сразу')
        },
        get description() {
            return t(
                'Задачи, привычки и события — в одной ленте дня, без переключения между разделами.',
            )
        },
        features: [
            {
                get title() {
                    return t('Задачи и привычки на шкале')
                },
                get description() {
                    return t(
                        'Дела с датой и привычки сами появляются в расписании дня — заводить их отдельно не нужно',
                    )
                },
                animation: lottie['on-boarding'].calendar.graphic,
            },
            {
                get title() {
                    return t('Перетаскивание на лету')
                },
                get description() {
                    return t(
                        'Не подошло время — перетащите событие на шкале дня на новое, без открытия редактора',
                    )
                },
                animation: lottie['on-boarding'].calendar.drag,
            },
            {
                get title() {
                    return t('Месяц и день')
                },
                get description() {
                    return t(
                        'Переключайтесь между обзором месяца и подробным планом дня одним жестом',
                    )
                },
                animation: lottie['on-boarding'].calendar.month,
            },
        ],
    },
    {
        key: 'settings',
        animation: lottie['on-boarding'].settings.main,
        get title() {
            return t('Настройте приложение под себя')
        },
        get description() {
            return t(
                'От внешнего вида до того, когда и о чём напоминать, — решаете вы.',
            )
        },
        features: [
            {
                get title() {
                    return t('Уведомления по отдельности')
                },
                get description() {
                    return t(
                        'Включайте напоминания о задачах, привычках, календаре и серии — каждое по своему расписанию',
                    )
                },
                animation: lottie['on-boarding'].settings.notify,
            },
            {
                get title() {
                    return t('Свой процесс работы')
                },
                get description() {
                    return t(
                        'Статусы, приоритеты и группы задач — настройте их так, как привыкли работать',
                    )
                },
                animation: lottie['on-boarding'].settings.process,
            },
            {
                get title() {
                    return t('Виджеты для рабочего экрана')
                },
                get description() {
                    return t(
                        'Виджеты для задач, привычек и календаря прямо на главном экране телефона',
                    )
                },
                animation: lottie['on-boarding'].settings.widgets,
            },
        ],
    },
]
