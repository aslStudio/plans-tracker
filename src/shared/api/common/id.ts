import { randomUUID } from 'expo-crypto'

import type { EntityId } from './types'

export function generateId(): EntityId {
    return randomUUID()
}
