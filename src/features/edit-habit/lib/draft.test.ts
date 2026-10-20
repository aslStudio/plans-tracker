import {
    createEmptyDraft,
    draftToCreateInput,
    habitToDraft,
    isBlankDraft,
} from './draft'

const now = new Date().toISOString()

const habit = {
    id: '1',
    title: 'Пить воду',
    categoryId: 'health',
    description: '<p>Два литра в день</p>',
    repeat: { type: 'weekly' as const, daysOfWeek: [1, 3, 5] as [1, 3, 5] },
    createdAt: now,
    updatedAt: now,
}

describe('createEmptyDraft', () => {
    it('starts blank with a daily repeat rule', () => {
        expect(createEmptyDraft()).toEqual({
            title: '',
            startMinute: null,
            durationMinutes: 60,
            categoryId: null,
            note: '',
            description: '',
            repeat: { type: 'daily' },
        })
    })
})

describe('habitToDraft', () => {
    it('copies the habit fields a draft can edit', () => {
        expect(habitToDraft(habit)).toEqual({
            title: 'Пить воду',
            startMinute: null,
            durationMinutes: 60,
            categoryId: 'health',
            note: '',
            description: '<p>Два литра в день</p>',
            repeat: { type: 'weekly', daysOfWeek: [1, 3, 5] },
        })
    })

    it('defaults a missing categoryId to null', () => {
        expect(
            habitToDraft({ ...habit, categoryId: null }).categoryId,
        ).toBeNull()
    })

    it('defaults a missing description to an empty string', () => {
        const { description, ...withoutDescription } = habit
        expect(habitToDraft(withoutDescription).description).toBe('')
    })
})

describe('draftToCreateInput', () => {
    it('maps the draft straight onto the create input', () => {
        const draft = habitToDraft(habit)
        expect(draftToCreateInput(draft)).toEqual({
            title: 'Пить воду',
            startMinute: null,
            durationMinutes: 60,
            categoryId: 'health',
            note: '',
            description: '<p>Два литра в день</p>',
            repeat: { type: 'weekly', daysOfWeek: [1, 3, 5] },
        })
    })
})

describe('isBlankDraft', () => {
    it('is true when the title is empty or only whitespace', () => {
        expect(isBlankDraft(createEmptyDraft())).toBe(true)
        expect(isBlankDraft({ ...createEmptyDraft(), title: '   ' })).toBe(true)
    })

    it('is false once there is a real title', () => {
        expect(
            isBlankDraft({ ...createEmptyDraft(), title: 'Пить воду' }),
        ).toBe(false)
    })
})

it('preserves the opted-in habit schedule through editing and saving', () => {
    const scheduled = { ...habit, startMinute: 720, durationMinutes: 45 }
    expect(draftToCreateInput(habitToDraft(scheduled))).toMatchObject({
        startMinute: 720,
        durationMinutes: 45,
    })
})
