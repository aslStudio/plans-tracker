import {
    defaultTaskStatuses,
    DONE_STATUS_ID,
    TODO_STATUS_ID,
} from '@/shared/api'
import { resolveNextStatusId } from './status-cycle'
const custom = {
    id: 'work',
    label: 'В работе',
    order: 10,
    isCompleted: false,
    isBuiltIn: false,
}
it('pins the built-in endpoints even for legacy custom order values', () => {
    const statuses = [custom, ...defaultTaskStatuses]
    expect(resolveNextStatusId(TODO_STATUS_ID, statuses)).toBe(custom.id)
    expect(resolveNextStatusId(custom.id, statuses)).toBe(DONE_STATUS_ID)
    expect(resolveNextStatusId(DONE_STATUS_ID, statuses)).toBe(TODO_STATUS_ID)
})
it('respects custom order and falls back for missing or empty statuses', () => {
    const statuses = [
        ...defaultTaskStatuses,
        custom,
        { ...custom, id: 'test', order: 5 },
    ]
    expect(resolveNextStatusId(TODO_STATUS_ID, statuses)).toBe('test')
    expect(resolveNextStatusId('test', statuses)).toBe('work')
    expect(resolveNextStatusId('missing', statuses)).toBe(TODO_STATUS_ID)
    expect(resolveNextStatusId('missing', [])).toBe('missing')
})
