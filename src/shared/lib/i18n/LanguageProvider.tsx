import { useEffect, useState, type PropsWithChildren } from 'react'
import { initializeLanguage } from './index'

/** Load the saved choice before any screen or notification scheduler is mounted. */
export function LanguageProvider({ children }: PropsWithChildren) {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let active = true
        void initializeLanguage()
            .catch((error) => {
                console.warn('Could not restore app language', error)
            })
            .finally(() => {
                if (active) setReady(true)
            })
        return () => {
            active = false
        }
    }, [])
    return ready ? children : null
}
