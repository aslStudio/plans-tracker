import { useState } from 'react'
import { Modal, Pressable, View } from 'react-native'

import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'
import { TheText } from '@/shared/ui/TheText'

import type { NativeMenuProps } from './model'
import { useStyles } from './styles'

/** Android/web fallback — a Modal-based dropdown, same visual language (icon only on the active row) as the native iOS menu. */
export function NativeMenu({ trigger, items }: NativeMenuProps) {
    const [visible, setVisible] = useState(false)
    const styles = useStyles()
    const { colors } = useTheme()

    return (
        <>
            <Pressable onPress={() => setVisible(true)}>{trigger}</Pressable>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setVisible(false)}
                >
                    <View
                        style={[
                            styles.card,
                            { backgroundColor: colors.background.elevated },
                        ]}
                    >
                        {items.map((item) => (
                            <Pressable
                                key={item.key}
                                style={styles.row}
                                onPress={() => {
                                    setVisible(false)
                                    item.onPress()
                                }}
                            >
                                <TheText size="body">{item.label}</TheText>
                                {item.isActive && item.icon ? (
                                    <Icon
                                        name={item.icon}
                                        size={18}
                                        color="brand"
                                        style={
                                            item.iconFlipped
                                                ? styles.iconFlipped
                                                : undefined
                                        }
                                    />
                                ) : null}
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}
