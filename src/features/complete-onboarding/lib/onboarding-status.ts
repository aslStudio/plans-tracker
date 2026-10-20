import { createLocalValueStore } from '@/shared/api/common/local-value-store'

type OnboardingStatus = { completed: boolean }

const store = createLocalValueStore<OnboardingStatus>(
    'plans-tracker.onboarding-status',
    { completed: false },
)

export async function isOnboardingCompleted(): Promise<boolean> {
    const status = await store.get()
    return status.completed
}

export async function completeOnboarding(): Promise<void> {
    await store.update({ completed: true })
}
