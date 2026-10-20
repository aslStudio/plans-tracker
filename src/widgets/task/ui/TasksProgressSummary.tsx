import { t, useLanguage } from '@/shared/lib/i18n'
import { View } from 'react-native'
import type { TaskCompletion, TaskStatus } from '@/shared/api'
import { Section } from '@/shared/ui/Section'
import { TheText } from '@/shared/ui/TheText'
import { TodayProgressRing } from '@/widgets/habit'
import { computeTaskProgress } from '@/entities/task'
import type { GroupedTasks } from '@/entities/task'
import { useStyles } from './TasksProgressSummary.styles'

export function TasksProgressSummary({
    groups,
    statuses,
    completions,
    today,
}: {
    groups: GroupedTasks
    statuses: TaskStatus[]
    completions: TaskCompletion[]
    today: string
}) {
    useLanguage()

    const progress = computeTaskProgress(groups, statuses, completions, today)
    const styles = useStyles()
    return (
        <Section paddingTop={0} paddingBottom={8} cardVariant="glass">
            <View style={styles.row}>
                <TodayProgressRing
                    done={progress.done}
                    total={progress.total}
                    percentage={progress.percentage}
                />
                <View style={styles.texts}>
                    <TheText size="body" weight="600">
                        {t('Выполнение задач')}
                    </TheText>
                    <TheText size="footnote" color="labels-secondary">
                        {progress.total === 0
                            ? t('На сегодня задач нет')
                            : t('Прогресс на сегодня · {0}%', [
                                  progress.percentage,
                              ])}
                    </TheText>
                </View>
            </View>
        </Section>
    )
}
