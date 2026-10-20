import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { MemoryScreen } from '@/screens/MemoryScreen/MemoryScreen'
export default function MemoryRoute() {
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    return (
        <>
            <Stack.Screen
                options={{ presentation: 'modal', gestureEnabled: !busy }}
            />
            <MemoryScreen
                onClose={() => router.back()}
                onBusyChange={setBusy}
            />
        </>
    )
}
