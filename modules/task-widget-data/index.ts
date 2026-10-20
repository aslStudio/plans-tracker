import { requireOptionalNativeModule } from 'expo-modules-core'

export type WidgetTaskItem = {
    id: string
    title: string
    completed: boolean
    recurring: boolean
}
export type WidgetTaskDay = { date: string; items: WidgetTaskItem[] }
export type PendingTaskToggle = {
    id: string
    taskId: string
    date: string
    completed: boolean
}
const native = requireOptionalNativeModule<{
    updateTasks(json: string): void
    clearWidgetData(): void
    getPendingToggles(): Promise<string>
    acknowledgeToggle(id: string): Promise<void>
}>('TaskWidgetData')

export function clearTaskWidgetData() {
    native?.clearWidgetData()
}

export function updateTaskWidget(days: WidgetTaskDay[]) {
    native?.updateTasks(JSON.stringify(days))
}
export async function readPendingTaskToggles(): Promise<PendingTaskToggle[]> {
    if (!native) return []
    return JSON.parse(await native.getPendingToggles()) as PendingTaskToggle[]
}
export async function acknowledgeTaskToggle(id: string) {
    await native?.acknowledgeToggle(id)
}
