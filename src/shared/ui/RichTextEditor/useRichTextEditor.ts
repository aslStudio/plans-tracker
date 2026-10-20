import { t } from '@/shared/lib/i18n'
import { useRef, useState } from 'react'
import type { TextStyle } from 'react-native'
import type {
    EnrichedTextInputInstance,
    OnChangeStateEvent,
} from 'react-native-enriched-html'

export type FormatPinItem = {
    key: string
    /** Full word — screen-reader label only, never shown as visible text (the pins are glyph-only). */
    label: string
    glyph: string
    glyphStyle: TextStyle
    isActive: boolean
    onPress: () => void
}

export type UseRichTextEditorOptions = {
    initialContent: string
    placeholder: string
    onChange: (html: string) => void
    /** Fires on every cursor/selection move, including pressing Enter — a more reliable "something moved" signal than waiting for the next keystroke's content change. Screens use it to scroll the cursor into view above the keyboard right away instead of only after the user starts typing on the new line. */
    onCursorMove?: () => void
}

/**
 * Everything the task and habit description editors share: the native
 * editor's imperative ref, its live formatting state (updated via
 * `onChangeState`), and the inline-mark pins built from it — rendered by
 * `RichTextEditorContent` right above the editor. Only inline marks
 * (bold/italic/underline/strikethrough), no block types (heading/checklist/
 * quote) — those hit an Enter-key editing bug upstream in the native editor
 * with no reliable JS-side fix, so they were dropped rather than shipped
 * broken. Each screen only differs in `initialContent`/`onChange`.
 */
export function useRichTextEditor({
    initialContent,
    placeholder,
    onChange,
    onCursorMove,
}: UseRichTextEditorOptions) {
    const ref = useRef<EnrichedTextInputInstance>(null)
    const [state, setState] = useState<OnChangeStateEvent | null>(null)
    const [isFocused, setIsFocused] = useState(false)

    const formatItems: FormatPinItem[] = [
        {
            key: 'bold',
            label: t('Жирный'),
            glyph: t('Ж'),
            glyphStyle: { fontWeight: '700' },
            isActive: state?.bold.isActive ?? false,
            onPress: () => ref.current?.toggleBold(),
        },
        {
            key: 'italic',
            label: t('Курсив'),
            glyph: t('К'),
            glyphStyle: { fontStyle: 'italic' },
            isActive: state?.italic.isActive ?? false,
            onPress: () => ref.current?.toggleItalic(),
        },
        {
            key: 'underline',
            label: t('Подчёркнутый'),
            glyph: t('П'),
            glyphStyle: { textDecorationLine: 'underline' },
            isActive: state?.underline.isActive ?? false,
            onPress: () => ref.current?.toggleUnderline(),
        },
        {
            key: 'strikethrough',
            label: t('Зачёркнутый'),
            glyph: t('З'),
            glyphStyle: { textDecorationLine: 'line-through' },
            isActive: state?.strikeThrough.isActive ?? false,
            onPress: () => ref.current?.toggleStrikeThrough(),
        },
    ]

    return {
        ref,
        state,
        setState,
        isFocused,
        setIsFocused,
        formatItems,
        initialContent,
        placeholder,
        onChange,
        onCursorMove,
    }
}

export type RichTextEditorController = ReturnType<typeof useRichTextEditor>
