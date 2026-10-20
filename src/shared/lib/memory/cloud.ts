import { requireOptionalNativeModule } from 'expo'
import { Platform } from 'react-native'
type CloudModule = {
    account(): Promise<string>
    read(): Promise<{ payload: string; tag: string } | null>
    write(payload: string, expectedTag: string | null): Promise<string>
}
export const cloud =
    Platform.OS === 'ios'
        ? requireOptionalNativeModule<CloudModule>('PlansCloud')
        : null
