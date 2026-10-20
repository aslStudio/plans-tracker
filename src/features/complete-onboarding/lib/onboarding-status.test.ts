import AsyncStorage from '@react-native-async-storage/async-storage'

import { completeOnboarding, isOnboardingCompleted } from './onboarding-status'

beforeEach(async () => {
    await AsyncStorage.clear()
})

describe('onboarding-status', () => {
    it('is not completed by default', async () => {
        expect(await isOnboardingCompleted()).toBe(false)
    })

    it('is completed after completeOnboarding is called', async () => {
        await completeOnboarding()

        expect(await isOnboardingCompleted()).toBe(true)
    })
})
