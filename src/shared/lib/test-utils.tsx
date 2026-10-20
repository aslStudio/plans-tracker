import {
    render as rtlRender,
    type RenderOptions,
} from '@testing-library/react-native'
import type { PropsWithChildren, ReactElement } from 'react'

import { AccentProvider } from '@/shared/lib/theme/accent-provider'
import { ThemeModeProvider } from '@/shared/lib/theme/theme-mode-provider'

export * from '@testing-library/react-native'

function AllProviders({ children }: PropsWithChildren) {
    return (
        <ThemeModeProvider>
            <AccentProvider>{children}</AccentProvider>
        </ThemeModeProvider>
    )
}

export function render(ui: ReactElement, options?: RenderOptions) {
    return rtlRender(ui, { wrapper: AllProviders, ...options })
}
