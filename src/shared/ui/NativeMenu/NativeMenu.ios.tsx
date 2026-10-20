import { Button, Host, Menu, RNHostView } from '@expo/ui/swift-ui'

import { useTheme } from '@/shared/lib/theme/use-theme'

import type { NativeMenuProps } from './model'

/**
 * A native iOS `UIMenu` (SwiftUI `Menu`) — tap the trigger, get the
 * platform's own dropdown list, each row showing its icon only once it's
 * the active one (direction arrow for sort, checkmark for filter). Mirrors
 * plans-tracker's `HeaderMenuButton.ios.tsx`/`ProfileMenuButton.ios.tsx`.
 */
export function NativeMenu({ trigger, items }: NativeMenuProps) {
    const { colorScheme } = useTheme()

    return (
        <Host matchContents ignoreSafeArea="all" colorScheme={colorScheme}>
            <Menu label={<RNHostView matchContents>{trigger}</RNHostView>}>
                {items.map((item) => (
                    <Button
                        key={item.key}
                        label={item.label}
                        systemImage={
                            item.isActive ? item.systemImage : undefined
                        }
                        onPress={item.onPress}
                    />
                ))}
            </Menu>
        </Host>
    )
}
