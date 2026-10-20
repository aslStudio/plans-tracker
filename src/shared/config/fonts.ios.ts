/** iOS uses system fonts; never import bundled Apple font assets here. */
export const TextFontFamily = {
    regular: 'system-ui',
    regularItalic: 'system-ui',
    medium: 'system-ui',
    mediumItalic: 'system-ui',
    semibold: 'system-ui',
    semiboldItalic: 'system-ui',
    bold: 'system-ui',
    boldItalic: 'system-ui',
} as const

export const RoundedFontFamily = {
    regular: 'ui-rounded',
    medium: 'ui-rounded',
    semibold: 'ui-rounded',
    bold: 'ui-rounded',
} as const

export const AppFontSources = {}

export function useAppFonts(): [boolean, Error | null] {
    return [true, null]
}
