import * as AppleAuthentication from 'expo-apple-authentication'
import * as SecureStore from 'expo-secure-store'
import { currentUser, deleteAccount, signInWithApple } from './session'

jest.mock('expo-apple-authentication', () => ({
    isAvailableAsync: jest.fn(async () => true),
    signInAsync: jest.fn(async () => ({
        identityToken: 'apple-identity',
        authorizationCode: 'apple-code',
        fullName: { givenName: 'Test', familyName: 'User' },
    })),
    AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}))
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(async () => {}),
    getItemAsync: jest.fn(async () => null),
    deleteItemAsync: jest.fn(async () => {}),
}))

it('passes the server challenge to Apple and persists the backend session', async () => {
    const fetchMock = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ nonce: 'one-time-nonce' }) })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: 'access',
                refresh_token: 'refresh',
                token_type: 'Bearer',
                expires_in: 900,
                user: { id: 'user-1', email: null, display_name: 'Test User' },
            }),
        })
    global.fetch = fetchMock as typeof fetch

    await signInWithApple()

    expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith(expect.objectContaining({ nonce: 'one-time-nonce' }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://185.23.238.86.sslip.io/v1/auth/apple', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
            identity_token: 'apple-identity',
            authorization_code: 'apple-code',
            nonce: 'one-time-nonce',
            display_name: 'Test User',
        }),
    }))
    expect(currentUser()?.id).toBe('user-1')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('plans-tracker.auth-session', expect.stringContaining('"refresh_token":"refresh"'))
})

it('keeps the session on server failure and clears it after confirmed deletion', async () => {
    const fetchMock = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ nonce: 'one-time-nonce' }) })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: 'access',
                refresh_token: 'refresh',
                token_type: 'Bearer',
                expires_in: 900,
                user: { id: 'user-1', email: null, display_name: 'Test User' },
            }),
        })
        .mockResolvedValueOnce({ status: 503 })
        .mockResolvedValueOnce({ status: 204 })
    global.fetch = fetchMock as typeof fetch

    await signInWithApple()
    await expect(deleteAccount()).rejects.toThrow('account deletion failed: 503')
    expect(currentUser()?.id).toBe('user-1')

    await deleteAccount()
    expect(fetchMock).toHaveBeenLastCalledWith(
        'https://185.23.238.86.sslip.io/v1/auth/account',
        expect.objectContaining({ method: 'DELETE', headers: expect.objectContaining({ Authorization: 'Bearer access' }) }),
    )
    expect(currentUser()).toBeNull()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('plans-tracker.auth-session')
})
