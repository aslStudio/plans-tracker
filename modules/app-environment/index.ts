import { requireOptionalNativeModule } from 'expo-modules-core'

const native = requireOptionalNativeModule<{
    isTestFlight(): boolean
}>('AppEnvironment')

/** True only for a TestFlight install — distinct from an App Store release, which carries a production receipt instead of a sandbox one. Android and un-built dev-client sessions fall back to `false`. */
export function isTestFlightBuild(): boolean {
    return native?.isTestFlight() ?? false
}
