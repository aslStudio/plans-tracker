import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { View } from 'react-native'

import { RichTextEditorContent } from './RichTextEditorContent'
import { useRichTextEditor } from './useRichTextEditor'

function Example({ initialContent }: { initialContent: string }) {
    const [, setContent] = useState(initialContent)
    const controller = useRichTextEditor({
        initialContent,
        placeholder: 'Описание',
        onChange: setContent,
    })
    return (
        <View style={{ flex: 1 }}>
            <RichTextEditorContent controller={controller} />
        </View>
    )
}

const meta = {
    title: 'Shared/RichTextEditor',
    component: Example,
    args: {
        initialContent: '<p>Купить молоко</p>',
    },
} satisfies Meta<typeof Example>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { name: 'Песочница' }

export const Empty: Story = {
    name: 'Пустое описание',
    args: { initialContent: '' },
}
