import { View } from 'react-native'

import { Icon } from '@/shared/ui/Icon'
import { NativeMenu } from '@/shared/ui/NativeMenu'
import { Row } from '@/shared/ui/Row'
import { TheText } from '@/shared/ui/TheText'

import type { PropertyRowProps } from './model'
import { useStyles } from './styles'

/** A `Row` whose value opens a `NativeMenu` of choices — the chevron and value text both pick up `valueColor` so the row itself hints at the selected option. Only that value/chevron cluster is the `NativeMenu` trigger (not the whole row), so the tap target and the native menu's own press animation stay on the right side instead of spanning the label too. Shared by `TaskDetailsScreen` (status/group/priority) and `HabitDetailScreen` (category/repeat). */
export function PropertyRow({
    label,
    valueLabel,
    valueColor,
    items,
}: PropertyRowProps) {
    const styles = useStyles()

    return (
        <Row
            label={label}
            RightElement={
                <NativeMenu
                    items={items}
                    trigger={
                        <View style={styles.value}>
                            <TheText
                                size="body"
                                color={valueColor ?? 'labels-secondary'}
                            >
                                {valueLabel}
                            </TheText>
                            <Icon
                                name="chevron-up-down"
                                size={18}
                                color={valueColor ?? 'labels-tertiary'}
                            />
                        </View>
                    }
                />
            }
        />
    )
}
