import { Redirect } from 'expo-router'
import { todayDateString } from '@/shared/lib/date'

export default function QuickTaskRoute() {
    return (
        <Redirect
            href={{
                pathname: '/task/[id]',
                params: { id: 'new', date: todayDateString() },
            }}
        />
    )
}
