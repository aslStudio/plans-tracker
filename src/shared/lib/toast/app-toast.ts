export type AppToastMessage = {
    title: string
    description: string
    animation?: 'plus' | 'done' | 'warning'
}

type ToastListener = (message: AppToastMessage) => void

const listeners = new Set<ToastListener>()
let pendingMessage: AppToastMessage | null = null

export function showAppToast(message: AppToastMessage, delayMs = 0) {
    const publish = () => {
        if (listeners.size === 0) {
            pendingMessage = message
            return
        }
        listeners.forEach((listener) => listener(message))
    }

    if (delayMs > 0) setTimeout(publish, delayMs)
    else publish()
}

export function subscribeToAppToast(listener: ToastListener) {
    listeners.add(listener)
    if (pendingMessage) {
        listener(pendingMessage)
        pendingMessage = null
    }

    return () => listeners.delete(listener)
}
