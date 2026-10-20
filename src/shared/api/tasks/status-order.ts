import { DONE_STATUS_ID, TODO_STATUS_ID, type TaskStatus } from './model'

/** Canonical order also repairs legacy data that placed custom statuses after Done. */
export function orderTaskStatuses(statuses: TaskStatus[]): TaskStatus[] {
    return [...statuses]
        .sort((a, b) => {
            if (a.id === b.id) return 0
            if (a.id === TODO_STATUS_ID || b.id === DONE_STATUS_ID) return -1
            if (b.id === TODO_STATUS_ID || a.id === DONE_STATUS_ID) return 1
            return a.order - b.order || a.id.localeCompare(b.id)
        })
        .map((status, order) => ({
            ...status,
            order,
            isCompleted: status.id === DONE_STATUS_ID,
        }))
}
