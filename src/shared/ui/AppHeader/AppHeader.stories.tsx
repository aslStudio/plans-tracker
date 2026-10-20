import type { Meta, StoryObj } from '@storybook/react-native'
import { ScrollView, Text, View } from 'react-native'

import { TheButtonIcon } from '@/shared/ui/TheButtonIcon'
import { TheText } from '@/shared/ui/TheText'

import { AppHeader } from './AppHeader'
import { APP_HEADER_ROW_HEIGHT } from './styles'

function ScrollingBackdrop() {
    return (
        <ScrollView
            contentContainerStyle={{ paddingTop: APP_HEADER_ROW_HEIGHT + 60 }}
        >
            {Array.from({ length: 30 }, (_, index) => (
                <View
                    key={index}
                    style={{
                        height: 44,
                        justifyContent: 'center',
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(128,128,128,0.2)',
                    }}
                >
                    <Text>{`Строка ${index + 1}`}</Text>
                </View>
            ))}
        </ScrollView>
    )
}

const meta = {
    title: 'Shared/AppHeader',
    component: AppHeader,
    parameters: { noSafeArea: true },
} satisfies Meta<typeof AppHeader>

export default meta
type Story = StoryObj<typeof meta>

export const ScreenHeader: Story = {
    name: 'Шапка экрана',
    render: () => (
        <View style={{ flex: 1 }}>
            <ScrollingBackdrop />
            <AppHeader
                LeftItem={
                    <TheText size="title-1" weight="700">
                        Задачи
                    </TheText>
                }
                RightItem={
                    <TheButtonIcon
                        icon="plus"
                        size="36"
                        accessibilityLabel="Добавить задачу"
                        onPress={() => {}}
                    />
                }
            />
        </View>
    ),
}

export const ModalHeader: Story = {
    name: 'Модальная шапка',
    render: () => (
        <View style={{ flex: 1 }}>
            <ScrollingBackdrop />
            <AppHeader
                isModal
                LeftItem={
                    <TheButtonIcon
                        icon="trash"
                        size="36"
                        variant="plain"
                        view="destructive"
                        accessibilityLabel="Удалить задачу"
                        onPress={() => {}}
                    />
                }
                RightItem={
                    <TheButtonIcon
                        icon="xmark"
                        size="36"
                        variant="plain"
                        view="grouped"
                        accessibilityLabel="Закрыть"
                        onPress={() => {}}
                    />
                }
            />
        </View>
    ),
}
