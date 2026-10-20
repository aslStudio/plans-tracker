import { t, useLanguage } from '@/shared/lib/i18n'
import { Fragment } from 'react'
import { ScrollView, View } from 'react-native'

import { Icon } from '@/shared/ui/Icon'
import { Placeholder } from '@/shared/ui/Placeholder'
import { Row } from '@/shared/ui/Row'
import { Section } from '@/shared/ui/Section'
import { Separator } from '@/shared/ui/Separator'
import { TheText } from '@/shared/ui/TheText'

import type { SummaryScreenProps } from './model'
import { useStyles } from './styles'

export function SummaryScreen({ stats, isLoading }: SummaryScreenProps) {
    useLanguage()

    const styles = useStyles()

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TheText size="large-title" weight="700">
                    {t('Сводка')}
                </TheText>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {stats.length === 0 && !isLoading ? (
                    <Placeholder
                        title={t('Пока нечего показать')}
                        description={t(
                            'Здесь появится прогресс по задачам и привычкам',
                        )}
                    >
                        <Icon
                            name="target"
                            size={40}
                            color="labels-secondary"
                        />
                    </Placeholder>
                ) : (
                    <Section>
                        {stats.map((stat, index) => (
                            <Fragment key={stat.id}>
                                {index > 0 && <Separator offsetLeft={16} />}
                                <Row
                                    label={stat.label}
                                    RightElement={
                                        <TheText
                                            size="body"
                                            weight="600"
                                            color="labels-secondary"
                                        >
                                            {stat.value}
                                        </TheText>
                                    }
                                />
                            </Fragment>
                        ))}
                    </Section>
                )}
            </ScrollView>
        </View>
    )
}
