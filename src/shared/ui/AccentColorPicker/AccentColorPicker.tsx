import { t, useLanguage } from '@/shared/lib/i18n'
import { View } from 'react-native'

import { AccentColorValues, type AccentColor } from '@/shared/config/color'
import { hapticTap } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { Icon } from '@/shared/ui/Icon'
import { AnimatedColorSwatch } from '@/shared/ui/AnimatedColorSwatch'

import type { AccentColorPickerProps } from './model'
import { useStyles } from './styles'

/** Emits the semantic `AccentColor` *name* — what `TaskGroup.color`/`TaskPriority.color` actually store, resolved to a real color at render time wherever they're displayed. */
export function AccentColorPicker({
    value,
    allowNoColor,
    onChange,
}: AccentColorPickerProps) {
    useLanguage()

    const styles = useStyles()
    const { colors } = useTheme()

    return (
        <View style={styles.root}>
            {allowNoColor && (
                <AnimatedColorSwatch
                    accessibilityLabel={t('Без цвета')}
                    size={0}
                    style={styles.swatch}
                    color={colors.background.secondary}
                    outlineColor={colors.labels.tertiary}
                    selected={value === null}
                    onPress={() => {
                        hapticTap()
                        onChange(null)
                    }}
                >
                    <View
                        style={[
                            styles.noColorStrike,
                            { backgroundColor: colors.labels.secondary },
                        ]}
                    />
                </AnimatedColorSwatch>
            )}
            {AccentColorValues.map((accent) => (
                <AccentSwatch
                    key={accent}
                    accent={accent}
                    isActive={value === accent}
                    onChange={onChange}
                />
            ))}
        </View>
    )
}

function AccentSwatch({
    accent,
    isActive,
    onChange,
}: {
    accent: AccentColor
    isActive: boolean
    onChange: AccentColorPickerProps['onChange']
}) {
    const styles = useStyles()
    const { colors } = useTheme()
    const swatchColor = useThemeColor(accent)

    return (
        <AnimatedColorSwatch
            accessibilityLabel={accent}
            size={0}
            style={styles.swatch}
            color={swatchColor}
            selected={isActive}
            outlineColor={swatchColor}
            onPress={() => {
                hapticTap()
                onChange(accent)
            }}
        >
            {isActive && (
                <Icon
                    name="check-outline"
                    size={16}
                    nativeColor={colors.gray.white}
                />
            )}
        </AnimatedColorSwatch>
    )
}
