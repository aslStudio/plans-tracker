import type { ThemeColorSource } from '@/shared/ui/TheText'

import { buildEditorHtmlStyle } from './editor-theme'

const colors: ThemeColorSource = {
    brand: 'rgb(1,1,1)',
    brandSecondary: 'rgb(2,2,2)',
    accent: { red: 'rgb(255,0,0)' },
    labels: {
        primary: 'rgb(10,10,10)',
        secondary: 'rgb(20,20,20)',
        tertiary: 'rgb(30,30,30)',
    },
    background: { primary: 'rgb(40,40,40)', elevated: 'rgb(50,50,50)' },
    gray: {
        black: 'rgb(0,0,0)',
        white: 'rgb(255,255,255)',
        gray: 'rgb(128,128,128)',
    },
}

describe('buildEditorHtmlStyle', () => {
    it('colors the blockquote border and text from the app theme', () => {
        const style = buildEditorHtmlStyle(colors)

        expect(style.blockquote).toMatchObject({
            borderColor: colors.brand,
            color: colors.labels.secondary,
        })
    })

    it('colors the checklist box from the brand color', () => {
        const style = buildEditorHtmlStyle(colors)

        expect(style.ulCheckbox).toMatchObject({ boxColor: colors.brand })
    })

    it('sizes headings from largest to smallest', () => {
        const style = buildEditorHtmlStyle(colors)

        expect(style.h1!.fontSize!).toBeGreaterThan(style.h2!.fontSize!)
        expect(style.h2!.fontSize!).toBeGreaterThan(style.h3!.fontSize!)
    })
})
