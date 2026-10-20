import { t, useLanguage } from '@/shared/lib/i18n'
import { EnrichedTextInput } from 'react-native-enriched-html'
import { Pressable, View } from 'react-native'

import { buildEditorHtmlStyle } from '@/shared/lib/editor-theme'
import { hapticTap } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'
import { Icon } from '@/shared/ui/Icon'
import { resolveTextColor, TheText } from '@/shared/ui/TheText'

import type { RichTextEditorContentProps } from './model'
import { useStyles } from './styles'
import type { FormatPinItem } from './useRichTextEditor'

/**
 * The format-pin row plus the native description editor itself. Only the
 * inline marks (bold/italic/underline/strikethrough) — no block types, see
 * `useRichTextEditor`'s docstring. The four marks plus the "Готово" chip
 * (shown only while the editor is focused) always fit on one line, so the
 * row is a plain `space-between` row — marks on the left, "Готово" pinned to
 * the right — instead of a horizontal scroll.
 */
export function RichTextEditorContent({
    controller,
}: RichTextEditorContentProps) {
    useLanguage()

    const styles = useStyles()
    const { colors } = useTheme()
    const {
        ref,
        setState,
        isFocused,
        setIsFocused,
        formatItems,
        initialContent,
        placeholder,
        onChange,
        onCursorMove,
    } = controller

    return (
        <View style={styles.root}>
            <View style={styles.formatRow}>
                <View style={styles.marksGroup}>
                    {formatItems.map((item) => (
                        <FormatPin key={item.key} item={item} />
                    ))}
                </View>
                {isFocused && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('Готово')}
                        style={[
                            styles.formatPin,
                            { backgroundColor: colors.brand },
                        ]}
                        onPress={() => {
                            hapticTap()
                            ref.current?.blur()
                        }}
                    >
                        <Icon
                            name="check-outline"
                            size={18}
                            nativeColor={colors.gray.white}
                        />
                    </Pressable>
                )}
            </View>
            <EnrichedTextInput
                ref={ref}
                defaultValue={initialContent}
                placeholder={placeholder}
                placeholderTextColor={resolveTextColor(
                    colors,
                    'labels-tertiary',
                )}
                cursorColor={colors.brand}
                selectionColor={colors.brandSecondary}
                scrollEnabled={false}
                style={styles.editor}
                htmlStyle={buildEditorHtmlStyle(colors)}
                onChangeHtml={(event) => onChange(event.nativeEvent.value)}
                onChangeState={(event) => setState(event.nativeEvent)}
                onChangeSelection={() => onCursorMove?.()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </View>
    )
}

function FormatPin({ item }: { item: FormatPinItem }) {
    const styles = useStyles()
    const { colors } = useTheme()

    return (
        <Pressable
            style={[
                styles.formatPin,
                item.isActive && { backgroundColor: colors.brandSecondary },
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: item.isActive }}
            onPress={() => {
                hapticTap()
                item.onPress()
            }}
        >
            <TheText
                size="body"
                weight="700"
                color={item.isActive ? 'brand' : 'labels-primary'}
                style={item.glyphStyle}
            >
                {item.glyph}
            </TheText>
        </Pressable>
    )
}
