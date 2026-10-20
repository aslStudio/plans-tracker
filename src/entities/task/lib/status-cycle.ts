import { orderTaskStatuses } from '@/shared/api/tasks/status-order'
import type { EntityId, TaskStatus } from '@/shared/api'

/** Advances to the next status by `order`, wrapping back to the first after the last — the strict ordering the status model was always meant to support. Unknown/missing current status just lands on the first one. */
export function resolveNextStatusId(
    currentStatusId: EntityId,
    statuses: TaskStatus[],
): EntityId {
    const sorted = orderTaskStatuses(statuses)
    if (sorted.length === 0) return currentStatusId
    const currentIndex = sorted.findIndex(
        (status) => status.id === currentStatusId,
    )
    const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % sorted.length
    return sorted[nextIndex].id
}
