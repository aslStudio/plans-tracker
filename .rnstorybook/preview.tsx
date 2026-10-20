import type { Preview } from '@storybook/react-native'

import { AccentProvider } from '@/shared/lib/theme/accent-provider'
import { ThemeModeProvider } from '@/shared/lib/theme/theme-mode-provider'

const preview: Preview = {
    decorators: [
        (Story) => (
            <ThemeModeProvider>
                <AccentProvider>
                    <Story />
                </AccentProvider>
            </ThemeModeProvider>
        ),
    ],
}

export default preview
