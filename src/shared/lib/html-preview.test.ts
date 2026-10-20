import { htmlToPreviewText } from './html-preview'

describe('htmlToPreviewText', () => {
    it('strips tags, leaving just the text', () => {
        expect(htmlToPreviewText('<p>Привет</p>')).toBe('Привет')
    })

    it('joins separate blocks with a space instead of running them together', () => {
        expect(htmlToPreviewText('<p>Купить</p><p>молоко</p>')).toBe(
            'Купить молоко',
        )
    })

    it('decodes common HTML entities', () => {
        expect(htmlToPreviewText('<p>Текст&nbsp;&amp;&nbsp;ещё</p>')).toBe(
            'Текст & ещё',
        )
    })

    it('collapses repeated whitespace', () => {
        expect(htmlToPreviewText('<p>а   б\n\nв</p>')).toBe('а б в')
    })

    it('returns an empty string for markup with no visible text', () => {
        expect(htmlToPreviewText('<p></p>')).toBe('')
    })
})
