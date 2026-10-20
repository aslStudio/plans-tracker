import React, { useState } from 'react'
import { Text, TextInput } from 'react-native'
import { act, render, screen, fireEvent } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    dayWord,
    getLanguage,
    getLocale,
    initializeLanguage,
    LANGUAGE_STORAGE_KEY,
    localizedLabels,
    setLanguage,
    systemLanguage,
    t,
    useLanguage,
} from './index'
import { builtinLabel } from './builtin-label'

beforeEach(async () => {
    await setLanguage('ru')
    jest.clearAllMocks()
})
afterEach(async () => {
    await setLanguage('ru')
})
it.each([
    ['ru', 'ru'],
    ['ru-RU', 'ru'],
    ['RU_tr', 'ru'],
    ['en', 'en'],
    ['tr-TR', 'en'],
    [null, 'en'],
])('resolves system language %s', (tag, expected) => {
    expect(systemLanguage(tag)).toBe(expected)
})
it('restores a persisted preference', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    await initializeLanguage()
    expect(getLanguage()).toBe('en')
})
it('persists changes and updates locale and exported labels', async () => {
    const labels = localizedLabels(['Сегодня'])
    await setLanguage('en')
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        LANGUAGE_STORAGE_KEY,
        'en',
    )
    expect(getLocale()).toBe('en-US')
    expect(labels[0]).toBe('Today')
    expect(dayWord(21)).toBe('days')
    await setLanguage('ru')
    expect(labels[0]).toBe('Сегодня')
    expect(dayWord(21)).toBe('день')
})
it('updates mounted UI without losing form state', async () => {
    function Form() {
        useLanguage()
        const [value, setValue] = useState('')
        return (
            <>
                <Text>{t('Язык')}</Text>
                <TextInput
                    testID="draft"
                    value={value}
                    onChangeText={setValue}
                />
            </>
        )
    }
    render(<Form />)
    fireEvent.changeText(screen.getByTestId('draft'), 'Моя задача')
    await act(() => setLanguage('en'))
    expect(screen.getByText('Language')).toBeTruthy()
    expect(screen.getByTestId('draft').props.value).toBe('Моя задача')
})
it('preserves custom labels and translates untouched built-in labels', async () => {
    await setLanguage('en')
    expect(
        builtinLabel({
            id: 'priority-high',
            label: 'Высокий',
            isBuiltIn: true,
        }),
    ).toBe('High')
    expect(
        builtinLabel({ id: 'priority-high', label: 'Срочно', isBuiltIn: true }),
    ).toBe('Срочно')
    expect(
        builtinLabel({ id: 'custom', label: 'Высокий', isBuiltIn: false }),
    ).toBe('Высокий')
    expect(t('{0}', ['Сегодня'])).toBe('Сегодня')
})
it('saves rapid selections in order and recovers after failed writes', async () => {
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk'))
    await expect(setLanguage('en')).rejects.toThrow('disk')
    await Promise.all([setLanguage('ru'), setLanguage('en')])
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
})
