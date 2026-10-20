import React from 'react'
import { Pressable, View } from 'react-native'

import { hapticTap } from '@/shared/lib/haptics'
import { TheText } from '@/shared/ui/TheText'

import { type RowProps } from './model'
import { useStyles } from './styles'

/**
 * Generic settings-list row: optional left `icon` slot, a `label`/`description`
 * pair, and an arbitrary `RightElement` (chevron, Toggle, value text, ...).
 * Renders as a `Pressable` only when `onPress` is given — e.g. a `ToggleRow`
 * has nothing for the row itself to do, the `Toggle` handles its own gesture.
 */
export const Row: React.FC<RowProps> = ({
    label,
    labelAccessory,
    description,
    icon,
    RightElement,
    onPress,
    onLabelPress,
    disabled,
    labelColor = 'labels-primary',
    testID,

    paddingVertical = 10,
    paddingHorizontal = 16,
}) => {
    const styles = useStyles()

    const leftContent = (
        <>
            {icon}
            <View style={styles.inner}>
                {labelAccessory ? (
                    <View style={styles.labelAccessoryRow}>
                        <TheText
                            size="body"
                            color={disabled ? 'labels-tertiary' : labelColor}
                            numberOfLines={1}
                            style={styles.labelFlex}
                        >
                            {label}
                        </TheText>
                        {labelAccessory}
                    </View>
                ) : (
                    <TheText
                        size="body"
                        color={disabled ? 'labels-tertiary' : labelColor}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {label}
                    </TheText>
                )}
                {description ? (
                    <TheText
                        size="subheadline"
                        color="labels-secondary"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {description}
                    </TheText>
                ) : null}
            </View>
        </>
    )

    if (onLabelPress) {
        return (
            <View style={[styles.root, { paddingVertical, paddingHorizontal }]} testID={testID}>
                <Pressable
                    style={styles.labelPressable}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => {
                        hapticTap()
                        onLabelPress()
                    }}
                    disabled={disabled}
                >
                    {leftContent}
                </Pressable>
                {RightElement}
            </View>
        )
    }

    const content = (
        <>
            {leftContent}
            {RightElement}
        </>
    )

    if (!onPress) {
        return (
            <View style={[styles.root, { paddingVertical, paddingHorizontal }]} testID={testID}>
                {content}
            </View>
        )
    }

    return (
        <Pressable
            style={[styles.root, { paddingVertical, paddingHorizontal }]}
            onPress={() => {
                hapticTap()
                onPress()
            }}
            disabled={disabled}
            testID={testID}
        >
            {content}
        </Pressable>
    )
}
