import { t } from '@/shared/lib/i18n'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

import { toLocalDateString } from '@/shared/lib/date'

const LOG_STORAGE_KEY = 'plans-tracker.diagnostics.logs'
const MAX_LOG_ENTRIES = 1200
const MAX_LOG_BYTES = 500_000

export type AppLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
export type AppLogEntry = {
    timestamp: string
    level: AppLogLevel
    scope: string
    event: string
    details?: Record<string, unknown>
}
type StoredLogs = { date: string; entries: AppLogEntry[] }

let writeQueue: Promise<void> = Promise.resolve()
let errorHandlerInstalled = false

function safeValue(value: unknown, depth = 0): unknown {
    if (
        value == null ||
        typeof value === 'boolean' ||
        typeof value === 'number'
    ) {
        return value
    }
    if (typeof value === 'string') return value.slice(0, 1200)
    if (Array.isArray(value))
        return value.slice(0, 40).map((item) => safeValue(item, depth + 1))
    if (typeof value === 'object') {
        if (depth > 2) return '[nested object omitted]'
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .slice(0, 40)
                .map(([key, item]) => [
                    key.slice(0, 80),
                    safeValue(item, depth + 1),
                ]),
        )
    }
    return String(value).slice(0, 1200)
}

function getToday() {
    return toLocalDateString(new Date())
}

function readStored(raw: string | null): StoredLogs {
    const date = getToday()
    if (!raw) return { date, entries: [] }
    try {
        const parsed = JSON.parse(raw) as Partial<StoredLogs>
        if (parsed.date !== date || !Array.isArray(parsed.entries)) {
            return { date, entries: [] }
        }
        return { date, entries: parsed.entries as AppLogEntry[] }
    } catch {
        return { date, entries: [] }
    }
}

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const run = writeQueue.then(operation)
    writeQueue = run.then(
        () => undefined,
        () => undefined,
    )
    return run
}

export function logAppEvent(
    level: AppLogLevel,
    scope: string,
    event: string,
    details?: Record<string, unknown>,
): Promise<void> {
    return enqueue(async () => {
        const stored = readStored(await AsyncStorage.getItem(LOG_STORAGE_KEY))
        const entry: AppLogEntry = {
            timestamp: new Date().toISOString(),
            level,
            scope: scope.slice(0, 80),
            event: event.slice(0, 120),
            ...(details
                ? { details: safeValue(details) as Record<string, unknown> }
                : {}),
        }
        stored.entries.push(entry)
        let serialized = JSON.stringify(stored)
        while (
            stored.entries.length > MAX_LOG_ENTRIES ||
            serialized.length > MAX_LOG_BYTES
        ) {
            stored.entries.shift()
            serialized = JSON.stringify(stored)
        }
        await AsyncStorage.setItem(LOG_STORAGE_KEY, serialized)
    }).catch(() => undefined)
}

export function logDebug(
    scope: string,
    event: string,
    details?: Record<string, unknown>,
) {
    return logAppEvent('DEBUG', scope, event, details)
}

export function logInfo(
    scope: string,
    event: string,
    details?: Record<string, unknown>,
) {
    return logAppEvent('INFO', scope, event, details)
}

export function logWarn(
    scope: string,
    event: string,
    details?: Record<string, unknown>,
) {
    return logAppEvent('WARN', scope, event, details)
}

export function logError(
    scope: string,
    event: string,
    error: unknown,
    details?: Record<string, unknown>,
) {
    const normalized =
        error instanceof Error
            ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack?.slice(0, 5000),
              }
            : { message: String(error).slice(0, 1200) }
    return logAppEvent('ERROR', scope, event, { ...details, error: normalized })
}

export async function listAppLogs(): Promise<AppLogEntry[]> {
    await writeQueue
    const stored = readStored(await AsyncStorage.getItem(LOG_STORAGE_KEY))
    const serialized = JSON.stringify(stored)
    await AsyncStorage.setItem(LOG_STORAGE_KEY, serialized)
    return stored.entries
}

export function clearAppLogs(): Promise<void> {
    return enqueue(async () => {
        await AsyncStorage.setItem(
            LOG_STORAGE_KEY,
            JSON.stringify({
                date: getToday(),
                entries: [],
            } satisfies StoredLogs),
        )
    })
}

export function formatAppLogs(entries: AppLogEntry[]): string {
    const header = [
        t('Plans Tracker — диагностический журнал'),
        t('Дата: {0}', [getToday()]),
        t('Версия: {0}', [Constants.expoConfig?.version ?? 'unknown']),
        t('Платформа: {0} {1}', [Platform.OS, String(Platform.Version)]),
        t('Записей: {0}', [entries.length]),
        '',
    ]
    const body = entries.map((entry) => {
        const details = entry.details ? ` ${JSON.stringify(entry.details)}` : ''
        return `${entry.timestamp} [${entry.level}] ${entry.scope}.${entry.event}${details}`
    })
    return [
        ...header,
        ...(body.length ? body : [t('Записей за сегодня пока нет.')]),
    ].join('\n')
}

export async function initializeAppLogger() {
    if (!errorHandlerInstalled) {
        const errorUtils = (
            globalThis as typeof globalThis & {
                ErrorUtils?: {
                    getGlobalHandler?: () => (
                        error: Error,
                        isFatal?: boolean,
                    ) => void
                    setGlobalHandler?: (
                        handler: (error: Error, isFatal?: boolean) => void,
                    ) => void
                }
            }
        ).ErrorUtils
        const previousHandler = errorUtils?.getGlobalHandler?.()
        errorUtils?.setGlobalHandler?.((error, isFatal) => {
            void logError('runtime', 'uncaught_exception', error, {
                isFatal: Boolean(isFatal),
            })
            previousHandler?.(error, isFatal)
        })
        errorHandlerInstalled = true
    }
    await logInfo('app', 'started', {
        platform: Platform.OS,
        osVersion: Platform.Version,
        appVersion: Constants.expoConfig?.version ?? 'unknown',
        runtimeVersion: Constants.expoConfig?.runtimeVersion ?? 'unknown',
    })
}
