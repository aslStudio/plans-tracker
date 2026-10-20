import { t } from './index'
const defaults: Record<string, string> = {
    'status-todo': 'К выполнению',
    'status-done': 'Готово',
    'priority-low': 'Низкий',
    'priority-medium': 'Средний',
    'priority-high': 'Высокий',
}
/** Translate untouched defaults only. Renamed and custom labels belong to the user. */
export function builtinLabel(item: {
    id: string
    label: string
    isBuiltIn?: boolean
}): string {
    return item.isBuiltIn && defaults[item.id] === item.label
        ? t(item.label)
        : item.label
}
