const ENTITY_DECODE_MAP: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
}

/** A one-line plain-text preview of rich-text HTML (the editor's own saved format) — for list rows, which must never show raw markup like `<p></p>`. */
export function htmlToPreviewText(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(
            /&[a-z#0-9]+;/gi,
            (entity) => ENTITY_DECODE_MAP[entity] ?? entity,
        )
        .replace(/\s+/g, ' ')
        .trim()
}
