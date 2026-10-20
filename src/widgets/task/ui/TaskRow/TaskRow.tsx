import { t, useLanguage } from '@/shared/lib/i18n'
import { Fragment } from 'react'
import { Pressable, View } from 'react-native'

import type { Color } from '@/shared/config/color'
import { hapticTap } from '@/shared/lib/haptics'
import { timeLabel } from '@/entities/calendar-event'
import { htmlToPreviewText } from '@/shared/lib/html-preview'
import { Icon } from '@/shared/ui/Icon'
import { TheText } from '@/shared/ui/TheText'

import { TaskRadio } from '../TaskRadio'
import type { TaskRowProps } from './model'
import { useStyles } from './styles'

type InfoSegment = { text: string; color: Color }

export function TaskRow({
    task,
    status,
    isOverdue,
    dateLineText,
    priorityLabel,
    groupLabel,
    onPress,
    onAdvanceStatus,
}: TaskRowProps) {
    useLanguage()

    const styles = useStyles()
    const isCompleted = status.isCompleted
    const titleColor = isOverdue
        ? 'accent-red'
        : isCompleted
          ? 'brand'
          : 'labels-primary'
    const dateColor = isOverdue ? 'accent-red' : 'labels-secondary'

    // Order: date, then priority, then group — falls back to the plain
    // description only once none of the three apply.
    const segments: InfoSegment[] = [
        dateLineText ? { text: dateLineText, color: dateColor } : null,
        task.startMinute != null
            ? {
                  text: `${timeLabel(task.startMinute)}–${timeLabel(task.startMinute + (task.durationMinutes ?? 60))}`,
                  color: dateColor,
              }
            : null,
        priorityLabel,
        groupLabel,
    ].filter((segment): segment is InfoSegment => segment !== null)
    const descriptionPreview = task.description
        ? htmlToPreviewText(task.description)
        : ''

    return (
        <View style={styles.root}>
            <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('Изменить статус')}
                onPress={() => {
                    hapticTap()
                    onAdvanceStatus()
                }}
            >
                <TaskRadio status={status} isOverdue={isOverdue} />
            </Pressable>
            <Pressable
                style={styles.content}
                onPress={() => {
                    hapticTap()
                    onPress()
                }}
            >
                <View style={styles.texts}>
                    <TheText
                        size="body"
                        color={titleColor}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={
                            isCompleted ? styles.titleStrikethrough : undefined
                        }
                    >
                        {task.title}
                    </TheText>

                    {segments.length > 0 ? (
                        <TheText
                            size="footnote"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {segments.map((segment, index) => (
                                <Fragment key={index}>
                                    {index > 0 && (
                                        <TheText
                                            size="footnote"
                                            color="labels-tertiary"
                                        >
                                            {' · '}
                                        </TheText>
                                    )}
                                    <TheText
                                        size="footnote"
                                        color={segment.color}
                                    >
                                        {segment.text}
                                    </TheText>
                                </Fragment>
                            ))}
                        </TheText>
                    ) : descriptionPreview ? (
                        <TheText
                            size="subheadline"
                            color="labels-secondary"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {descriptionPreview}
                        </TheText>
                    ) : null}
                </View>
                <Icon
                    name="line.3.horizontal"
                    size={20}
                    color="labels-tertiary"
                />
            </Pressable>
        </View>
    )
}
