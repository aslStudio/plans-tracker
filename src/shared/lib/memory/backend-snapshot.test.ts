import { mergeSnapshots, type Snapshot } from './backend-snapshot'

const key = 'plans-tracker.tasks'
function snapshot(records: { id: string; title: string; updatedAt?: string }[]): Snapshot {
    return {
        version: 2,
        data: { [key]: records },
        history: { habits: {}, deletedIds: {} },
        values: {},
    }
}

it('keeps independent offline edits from two devices', () => {
    const base = snapshot([{ id: 'a', title: 'Original' }])
    const local = snapshot([
        { id: 'a', title: 'Original' },
        { id: 'b', title: 'Local' },
    ])
    const remote = snapshot([
        { id: 'a', title: 'Original' },
        { id: 'c', title: 'Remote' },
    ])
    expect(mergeSnapshots(base, local, remote).data[key]).toEqual([
        { id: 'a', title: 'Original' },
        { id: 'b', title: 'Local' },
        { id: 'c', title: 'Remote' },
    ])
})

it('propagates a deletion when the other device has not changed the record', () => {
    const base = snapshot([{ id: 'a', title: 'Original' }])
    expect(mergeSnapshots(base, snapshot([]), base).data[key]).toEqual([])
    expect(mergeSnapshots(base, base, snapshot([])).data[key]).toEqual([])
})

it('uses the latest timestamp if both devices edit the same record', () => {
    const base = snapshot([{ id: 'a', title: 'Original', updatedAt: '2026-01-01T00:00:00Z' }])
    const local = snapshot([{ id: 'a', title: 'Local', updatedAt: '2026-01-02T00:00:00Z' }])
    const remote = snapshot([{ id: 'a', title: 'Remote', updatedAt: '2026-01-03T00:00:00Z' }])
    expect(mergeSnapshots(base, local, remote).data[key]).toEqual(remote.data[key])
})

it('keeps the account version of shared built-in records on first sign-in', () => {
    const local = snapshot([{ id: 'status-todo', title: 'Default' }, { id: 'guest-task', title: 'Guest' }])
    const remote = snapshot([{ id: 'status-todo', title: 'Renamed on account' }, { id: 'cloud-task', title: 'Cloud' }])
    expect(mergeSnapshots(null, local, remote).data[key]).toEqual([
        { id: 'status-todo', title: 'Renamed on account' },
        { id: 'guest-task', title: 'Guest' },
        { id: 'cloud-task', title: 'Cloud' },
    ])
})
