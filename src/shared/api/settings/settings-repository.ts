import { createLocalValueStore } from '../common/local-value-store'
import { type AppSettings, defaultAppSettings } from './model'

const store = createLocalValueStore<AppSettings>(
    'plans-tracker.settings',
    defaultAppSettings,
)

export const settingsRepository = {
    get(): Promise<AppSettings> {
        return store.get()
    },
    update(patch: Partial<AppSettings>): Promise<AppSettings> {
        return store.update(patch)
    },
}

export type SettingsRepository = typeof settingsRepository
