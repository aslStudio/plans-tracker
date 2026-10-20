import { Text } from 'react-native'

import { render } from '@/shared/lib/test-utils'

import { NativeMenu } from './NativeMenu'
import type { NativeMenuItem } from './model'

// Jest resolves the platform-specific `NativeMenu.ios.tsx` here (same
// haste-platform default noted in `ButtonBaseWrapper.test.tsx`), whose
// `@expo/ui/swift-ui` pieces are mocked in `jest.setup.ts` as plain, inert
// views — so this only exercises "renders without crashing, trigger is
// visible", not the Modal open/close behaviour that's specific to the
// Android/web fallback in `NativeMenu.tsx`.
describe('NativeMenu', () => {
    it('renders its trigger', () => {
        const items: NativeMenuItem[] = [
            {
                key: 'a',
                label: 'Вариант А',
                isActive: false,
                onPress: () => {},
            },
        ]
        const { getByText } = render(
            <NativeMenu items={items} trigger={<Text>Открыть</Text>} />,
        )

        expect(getByText('Открыть')).toBeTruthy()
    })
})
