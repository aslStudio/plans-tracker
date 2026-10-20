import type { HtmlStyle } from 'react-native-enriched-html'

import type { ThemeColorSource } from '@/shared/ui/TheText'

/** Styles the description editor's rendered HTML elements (headings, quote, lists, checklist) to match the live app theme instead of the library's unstyled defaults. */
export function buildEditorHtmlStyle(colors: ThemeColorSource): HtmlStyle {
    return {
        h1: { fontSize: 24, bold: true },
        h2: { fontSize: 20, bold: true },
        h3: { fontSize: 18, bold: true },
        blockquote: {
            borderColor: colors.brand,
            borderWidth: 3,
            gapWidth: 12,
            color: colors.labels.secondary,
        },
        a: { color: colors.brand, textDecorationLine: 'underline' },
        ul: { marginLeft: 20, gapWidth: 4 },
        ol: { marginLeft: 20, gapWidth: 4 },
        ulCheckbox: {
            boxSize: 18,
            gapWidth: 8,
            marginLeft: 0,
            boxColor: colors.brand,
        },
    }
}
