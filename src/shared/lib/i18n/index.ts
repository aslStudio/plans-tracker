import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { useSyncExternalStore } from 'react'
import messages from './en.json'

export type Language = 'ru' | 'en'
export const LANGUAGE_STORAGE_KEY = 'plans-tracker.language'
export function systemLanguage(tag: string | null | undefined): Language {
    return tag?.toLowerCase().split(/[-_]/)[0] === 'ru' ? 'ru' : 'en'
}
let language: Language = systemLanguage(getLocales()[0]?.languageCode)
const listeners = new Set<() => void>()
let revision = 0
let writes = Promise.resolve()
let initialization: Promise<void> | undefined
export const getLanguage = () => language
export const getLocale = () => (language === 'ru' ? 'ru-RU' : 'en-US')
export function subscribeLanguage(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}
function publish(value: Language) {
    if (language === value) return
    language = value
    listeners.forEach((listener) => listener())
}
export function initializeLanguage(): Promise<void> {
    if (!initialization) {
        const startedAt = revision
        initialization = AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
            .then((saved) => {
                if (
                    startedAt === revision &&
                    (saved === 'ru' || saved === 'en')
                )
                    publish(saved)
            })
            .catch((error) => {
                initialization = undefined
                throw error
            })
    }
    return initialization
}
export function setLanguage(value: Language): Promise<void> {
    if (value !== 'ru' && value !== 'en')
        return Promise.reject(new Error('Unsupported language'))
    revision++
    publish(value)
    const save = writes.then(() =>
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, value),
    )
    // One rejected write must not prevent subsequent choices from being saved.
    writes = save.catch(() => {})
    return save
}
export function useLanguage(): Language {
    return useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage)
}
/** Only explicit UI messages are translated; user-entered values are never looked up. */
export function t(source: string, values: readonly unknown[] = []): string {
    const template =
        language === 'ru'
            ? source
            : ((messages as Record<string, string>)[source] ?? source)
    return template.replace(/\{(\d+)\}/g, (token, index: string) =>
        Number(index) < values.length
            ? String(values[Number(index)] ?? '')
            : token,
    )
}
/** Lazy labels keep exported weekday/month arrays current after a language switch. */
export function localizedLabels(labels: readonly string[]): string[] {
    const result: string[] = []
    labels.forEach((label, index) => {
        Object.defineProperty(result, index, {
            enumerable: true,
            configurable: true,
            get: () => t(label),
        })
    })
    return result
}
export function dayWord(count: number): string {
    if (language === 'en') return count === 1 ? 'day' : 'days'
    const last = Math.abs(count) % 10,
        lastTwo = Math.abs(count) % 100
    return last === 1 && lastTwo !== 11
        ? 'день'
        : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)
          ? 'дня'
          : 'дней'
}
