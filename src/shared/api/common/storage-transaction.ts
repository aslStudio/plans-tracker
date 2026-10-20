import { setMemoryHistory } from '@/shared/lib/memory/history'
import {
    setArchive,
    setArchiveIndex,
    archiveIndexKey,
} from '@/shared/lib/memory/archive'
import AsyncStorage from '@react-native-async-storage/async-storage'

const journalKey = 'plans-tracker.memory-transaction'
let queue: Promise<unknown> = Promise.resolve()
/** All collection writes and maintenance share one queue. Recover interrupted commits first. */
export function withStorageTransaction<T>(work: () => Promise<T>): Promise<T> {
    const run = queue.then(async () => {
        const journal = await AsyncStorage.getItem(journalKey)
        if (journal) {
            const entries = JSON.parse(journal) as [string, string][]
            await AsyncStorage.multiSet(entries)
            await AsyncStorage.removeItem(journalKey)
            for (const [key, raw] of entries) {
                if (key === 'plans-tracker.memory-history')
                    setMemoryHistory(JSON.parse(raw))
                if (key === archiveIndexKey) {
                    setArchive({})
                    setArchiveIndex(JSON.parse(raw))
                }
            }
        }
        return work()
    })
    queue = run.then(
        () => undefined,
        () => undefined,
    )
    return run
}
/** Call inside withStorageTransaction. Journal contains the new state, never deleted content. */
export async function commitStorage(entries: [string, string][]) {
    await AsyncStorage.setItem(journalKey, JSON.stringify(entries))
    await AsyncStorage.multiSet(entries)
    await AsyncStorage.removeItem(journalKey)
}
