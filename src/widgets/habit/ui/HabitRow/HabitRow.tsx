import { Pressable, View } from 'react-native'

import { hapticTap } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'
import { TheText } from '@/shared/ui/TheText'

import { WeekStrip } from '../WeekStrip'
import type { HabitRowProps } from './model'
import { useStyles } from './styles'

/** Same two-hit-target shape as `TaskRow` — the radio is its own tap zone (today's toggle), the rest opens the habit for editing. A habit not due today gets a plain dim dot instead of a checkable radio; there's nothing to toggle. */
export function HabitRow({
    habit,
    category,
    isCompleted,
    isDue,
    completionActionLabel,
    weekStrip,
    onToggle,
    onPress,
}: HabitRowProps) {
    const styles = useStyles()
    const { colors } = useTheme()

    return (
        <View style={styles.root}>
            <Pressable
                hitSlop={8}
                disabled={!isDue}
                accessibilityRole="button"
                accessibilityLabel={completionActionLabel}
                onPress={() => {
                    hapticTap()
                    onToggle()
                }}
            >
                {isDue ? (
                    <View
                        style={[
                            styles.radio,
                            isCompleted
                                ? { backgroundColor: colors.brand }
                                : [
                                      styles.radioDue,
                                      { borderColor: colors.gray.gray },
                                  ],
                        ]}
                    >
                        {isCompleted && (
                            <Icon
                                name="check-outline"
                                size={16}
                                nativeColor={colors.gray.white}
                            />
                        )}
                    </View>
                ) : (
                    <View style={styles.radio}>
                        <View
                            style={[
                                styles.radioNotDue,
                                { backgroundColor: colors.fill.tertiary },
                            ]}
                        />
                    </View>
                )}
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
                        color={isCompleted ? 'brand' : 'labels-primary'}
                        style={
                            isCompleted ? styles.titleStrikethrough : undefined
                        }
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {habit.title}
                    </TheText>
                    <View style={styles.metaRow}>
                        {category && (
                            <TheText
                                size="footnote"
                                color={category.color ?? 'labels-secondary'}
                                numberOfLines={1}
                            >
                                {category.label}
                            </TheText>
                        )}
                        <WeekStrip days={weekStrip} />
                    </View>
                </View>
                <Icon name="chevron-right" size={16} color="labels-tertiary" />
            </Pressable>
        </View>
    )
}
