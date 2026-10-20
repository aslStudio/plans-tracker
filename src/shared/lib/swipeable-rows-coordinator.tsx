import { useFocusEffect } from 'expo-router'
import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react'
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'

export type SwipeableRowsCoordinator = {
    register: (id: string, instance: SwipeableMethods | null) => void
    notifyWillOpen: (id: string) => void
    /** Snaps any open row shut — call when the screen loses focus (switching tabs). */
    closeAll: () => void
}

const SwipeableRowsCoordinatorContext =
    createContext<SwipeableRowsCoordinator | null>(null)

/**
 * Wrap a swipeable list (tasks, habits, ...) with this so only one row can
 * be swiped open at a time, and any open row snaps shut on leaving the tab
 * instead of staying visually open. Mirrors plans-tracker's leaderboard
 * `SwipeableRowsCoordinatorProvider` (features/friends).
 */
export function SwipeableRowsCoordinatorProvider({
    children,
}: React.PropsWithChildren) {
    const rows = useRef(new Map<string, SwipeableMethods>())
    const openId = useRef<string | null>(null)
    const [coordinator] = useState<SwipeableRowsCoordinator>(() => ({
        register(id, instance) {
            if (instance) {
                rows.current.set(id, instance)
            } else {
                rows.current.delete(id)
                if (openId.current === id) openId.current = null
            }
        },
        notifyWillOpen(id) {
            if (openId.current && openId.current !== id) {
                rows.current.get(openId.current)?.close()
            }
            openId.current = id
        },
        closeAll() {
            rows.current.forEach((instance) => instance.close())
            openId.current = null
        },
    }))

    useFocusEffect(
        useCallback(() => {
            return () => coordinator.closeAll()
        }, [coordinator]),
    )

    return (
        <SwipeableRowsCoordinatorContext.Provider value={coordinator}>
            {children}
        </SwipeableRowsCoordinatorContext.Provider>
    )
}

export function useSwipeableRowsCoordinator() {
    return useContext(SwipeableRowsCoordinatorContext)
}
