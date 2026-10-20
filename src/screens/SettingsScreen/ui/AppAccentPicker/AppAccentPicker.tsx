import { t } from '@/shared/lib/i18n'
import { View } from 'react-native'

import { AccentNameValues, Colors } from '@/shared/config/theme'
import { hapticTap } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { AnimatedColorSwatch } from '@/shared/ui/AnimatedColorSwatch'

import { AccentCheckmark } from './AccentCheckmark'

import type { AppAccentPickerProps } from './model'
import { useStyles } from './styles'

const ACCENT_LABELS: Record<string, string> = {
    get turquoise() {
        return t('Бирюзовый')
    },
    get red() {
        return t('Красный')
    },
    get orange() {
        return t('Оранжевый')
    },
    get yellow() {
        return t('Жёлтый')
    },
    get green() {
        return t('Зелёный')
    },
    get blue() {
        return t('Синий')
    },
    get indigo() {
        return t('Индиго')
    },
    get softPink() {
        return t('Розовый')
    },
}

// `pink` sits right next to `red` in both light and dark palettes and reads
// as the same color at swatch size — dropped here so every remaining
// swatch is visually distinct. `softPink` already covers "pink".
const DISPLAYED_ACCENTS = AccentNameValues.filter((accent) => accent !== 'pink')

/** The app-wide brand color — distinct from `AccentColorPicker` (which picks a semantic `accent-*` swatch for one group/priority/category), this changes what `colors.brand` resolves to everywhere. */
export function AppAccentPicker({ value, onChange }: AppAccentPickerProps) {
    const styles = useStyles()
    const { colorScheme } = useTheme()

    return (
        <View style={styles.root}>
            {DISPLAYED_ACCENTS.map((accent) => {
                const swatchColor = Colors[colorScheme].accent[accent]
                const isActive = accent === value

                return (
                    <View key={accent} style={styles.item}>
                        <AnimatedColorSwatch
                            accessibilityLabel={ACCENT_LABELS[accent] ?? accent}
                            size={32}
                            color={swatchColor}
                            selected={isActive}
                            outlineColor={swatchColor}
                            onPress={() => {
                                hapticTap()
                                onChange(accent)
                            }}
                        >
                            {isActive && <AccentCheckmark />}
                        </AnimatedColorSwatch>
                    </View>
                )
            })}
        </View>
    )
}
