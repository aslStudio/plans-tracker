import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerRootComponent } from 'expo'
import { type ComponentType, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

type Startup = { component?: ComponentType; error?: string }

function StorybookRoot() {
    const [startup, setStartup] = useState<Startup>({})

    useEffect(() => {
        let active = true
        const timeout = setTimeout(() => {
            if (active)
                setStartup({
                    error: 'Подготовка историй заняла больше 30 секунд. Проверьте первую ошибку в терминале Metro и перезагрузите приложение.',
                })
        }, 30000)

        async function prepare() {
            try {
                // Keep the registry in the synchronous Metro graph, while catching story import errors.
                const { view } =
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    require('./storybook.requires') as typeof import('./storybook.requires')
                const component = view.getStorybookUI({
                    storage: {
                        getItem: AsyncStorage.getItem,
                        setItem: AsyncStorage.setItem,
                    },
                })
                await view.createPreparedStoryMapping()
                if (active) setStartup({ component })
            } catch (error) {
                console.error('[Storybook startup]', error)
                if (active)
                    setStartup({
                        error:
                            error instanceof Error
                                ? (error.stack ?? error.message)
                                : String(error),
                    })
            } finally {
                clearTimeout(timeout)
            }
        }
        void prepare()
        return () => {
            active = false
            clearTimeout(timeout)
        }
    }, [])

    const StorybookUI = startup.component
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                {StorybookUI ? (
                    <StorybookUI />
                ) : startup.error ? (
                    <ScrollView
                        contentContainerStyle={{
                            padding: 24,
                            paddingTop: 80,
                            gap: 16,
                        }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: '600' }}>
                            Не удалось запустить Storybook
                        </Text>
                        <Text selectable>{startup.error}</Text>
                    </ScrollView>
                ) : (
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                        }}
                    >
                        <ActivityIndicator />
                        <Text>Подготовка историй Storybook…</Text>
                    </View>
                )}
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}

registerRootComponent(StorybookRoot)
export default StorybookRoot
