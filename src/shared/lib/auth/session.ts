import * as AppleAuthentication from 'expo-apple-authentication'
import * as SecureStore from 'expo-secure-store'
import { useSyncExternalStore } from 'react'
import { Platform } from 'react-native'

export const API_BASE_URL = 'https://185.23.238.86.sslip.io'
const STORAGE_KEY = 'plans-tracker.auth-session'

export type AuthUser = {
    id: string
    email: string | null
    display_name: string | null
}
type Session = {
    access_token: string
    refresh_token: string
    token_type: 'Bearer'
    expires_in: number
    user: AuthUser
    expires_at: number
}
type AuthState = { ready: boolean; session: Session | null }
let state: AuthState = { ready: false, session: null }
const listeners = new Set<() => void>()
let refreshInFlight: Promise<Session> | null = null

function notify(next: AuthState) {
    state = next
    listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export function useAuthState() {
    return useSyncExternalStore(subscribe, () => state, () => state)
}

export function currentUser() {
    return state.session?.user ?? null
}

export async function restoreSession() {
    if (state.ready) return
    try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY)
        const saved = raw ? (JSON.parse(raw) as Session) : null
        notify({ ready: true, session: saved?.refresh_token ? saved : null })
    } catch {
        notify({ ready: true, session: null })
    }
}

async function saveSession(input: Omit<Session, 'expires_at'>) {
    const session = {
        ...input,
        expires_at: Date.now() + input.expires_in * 1000,
    }
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session))
    notify({ ready: true, session })
    return session
}

export async function apiRequest(
    path: string,
    init: RequestInit = {},
    token?: string,
): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
        return await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                ...(init.body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...init.headers,
            },
        })
    } finally {
        clearTimeout(timer)
    }
}

async function refreshSession(): Promise<Session> {
    if (refreshInFlight) return refreshInFlight
    const old = state.session
    if (!old) throw new Error('not authenticated')
    refreshInFlight = (async () => {
        const response = await apiRequest('/v1/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: old.refresh_token }),
        })
        if (response.status === 401) {
            if (state.session?.refresh_token === old.refresh_token) {
                await SecureStore.deleteItemAsync(STORAGE_KEY)
                notify({ ready: true, session: null })
            }
            throw new Error('session expired')
        }
        if (!response.ok) throw new Error(`refresh failed: ${response.status}`)
        if (state.session?.refresh_token !== old.refresh_token)
            throw new Error('session changed')
        return saveSession((await response.json()) as Omit<Session, 'expires_at'>)
    })()
    try {
        return await refreshInFlight
    } finally {
        refreshInFlight = null
    }
}

export async function authorizedRequest(path: string, init: RequestInit = {}) {
    let session = state.session
    if (!session) throw new Error('not authenticated')
    if (session.expires_at - Date.now() < 30000)
        session = await refreshSession()
    let response = await apiRequest(path, init, session.access_token)
    if (response.status === 401) {
        session = await refreshSession()
        response = await apiRequest(path, init, session.access_token)
    }
    return response
}

export async function signInWithApple() {
    if (Platform.OS !== 'ios' || !(await AppleAuthentication.isAvailableAsync()))
        throw new Error('Apple Sign In is not available on this device')
    const challenge = await apiRequest('/v1/auth/challenges', { method: 'POST' })
    if (!challenge.ok) throw new Error('server unavailable')
    const { nonce } = (await challenge.json()) as { nonce: string }
    const credential = await AppleAuthentication.signInAsync({
        nonce,
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    })
    if (!credential.identityToken || !credential.authorizationCode)
        throw new Error('Apple did not return credentials')
    const displayName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
    ]
        .filter(Boolean)
        .join(' ')
    const response = await apiRequest('/v1/auth/apple', {
        method: 'POST',
        body: JSON.stringify({
            identity_token: credential.identityToken,
            authorization_code: credential.authorizationCode,
            nonce,
            display_name: displayName,
        }),
    })
    if (!response.ok) throw new Error(`sign in failed: ${response.status}`)
    return saveSession((await response.json()) as Omit<Session, 'expires_at'>)
}

export async function signOut() {
    const session = state.session
    await SecureStore.deleteItemAsync(STORAGE_KEY)
    notify({ ready: true, session: null })
    if (!session) return
    try {
        await apiRequest('/v1/auth/logout', { method: 'POST' }, session.access_token)
    } catch {
        // A device can always leave an account while offline.
    }
}

export async function deleteAccount() {
    const response = await authorizedRequest('/v1/auth/account', {
        method: 'DELETE',
    })
    if (response.status !== 204)
        throw new Error(`account deletion failed: ${response.status}`)
    try {
        await SecureStore.deleteItemAsync(STORAGE_KEY)
    } finally {
        notify({ ready: true, session: null })
    }
}
