import type { Task, TaskStatus } from '@/shared/api'

import type { ResolvedGroupLabel, ResolvedPriorityLabel } from '@/entities/task'

export type TaskRowProps = {
    task: Task
    status: TaskStatus
    isOverdue: boolean
    /** Resolved by the caller via `resolveDateLineText` — `null` to show nothing on that line. */
    dateLineText: string | null
    /** `null` when priority is off entirely, or the task has none set — no fallback label, unlike a group's "Другие". */
    priorityLabel: ResolvedPriorityLabel | null
    /** `null` when groups are off entirely; otherwise always shows something ("Другие" for an ungrouped task). */
    groupLabel: ResolvedGroupLabel | null
    /** Opens the task's own detail screen — same action as tapping the title/info area or the trailing chevron, which is purely the visual hint that it's tappable. Does *not* fire from tapping the status circle — see `onAdvanceStatus`. */
    onPress: () => void
    /** Tapping the status circle itself cycles to the next status (by `order`), instead of opening the task — a separate hit target from `onPress`. */
    onAdvanceStatus: () => void
}
