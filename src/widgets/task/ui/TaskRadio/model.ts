import type { TaskStatus } from '@/shared/api'

export type TaskRadioProps = {
    status: TaskStatus
    isOverdue: boolean
    size?: number
}
