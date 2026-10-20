import { emptyEvent } from './planner'
import { eventDescription } from './description'

it('preserves old location and multiline notes as text, escaping HTML', () => {
    expect(
        eventDescription({
            ...emptyEvent('2026-10-15'),
            location: 'Дом & офис',
            notes: '<важно>\nВторая строка',
        }),
    ).toBe('<p>Дом &amp; офис</p><p>&lt;важно&gt;<br>Вторая строка</p>')
})

it('uses saved rich text and does not restore legacy text after clearing', () => {
    const event = {
        ...emptyEvent('2026-10-15'),
        notes: 'Old',
        description: '<p><strong>New</strong></p>',
    }
    expect(eventDescription(event)).toBe(event.description)
    expect(eventDescription({ ...event, description: '' })).toBe('')
})
