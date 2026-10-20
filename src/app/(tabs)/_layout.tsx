import { t, useLanguage } from '@/shared/lib/i18n'
import { Tabs as RouterTabs } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { Platform } from 'react-native'

import { AndroidTabBar } from '@/application/navigation/android-tab-bar'
import { hapticSelect } from '@/shared/lib/haptics'
import { useTheme } from '@/shared/lib/theme/use-theme'

export default function TabsLayout() {
    useLanguage()

    const { colors } = useTheme()

    if (Platform.OS === 'android') {
        return (
            <RouterTabs
                screenOptions={{ headerShown: false }}
                tabBar={(props) => <AndroidTabBar {...props} />}
            >
                <RouterTabs.Screen
                    name="index"
                    options={{ title: t('Задачи') }}
                />
                <RouterTabs.Screen
                    name="habits"
                    options={{ title: t('Привычки') }}
                />
                <RouterTabs.Screen
                    name="planner"
                    options={{ title: t('Календарь') }}
                />
            </RouterTabs>
        )
    }

    return (
        <NativeTabs
            tintColor={colors.brand}
            backgroundColor={colors.backgroundGrouped.secondary}
            blurEffect="systemMaterial"
            disableTransparentOnScrollEdge
            iconColor={{
                default: colors.labels.secondary,
                selected: colors.brand,
            }}
            minimizeBehavior="onScrollDown"
            screenListeners={{
                // Picking one of several tabs — same feedback as a segment
                // control, not a plain tap.
                tabPress: (e) => {
                    if (!e.data.isPrevented) hapticSelect()
                },
            }}
        >
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'checklist', selected: 'checklist' }}
                    md="checklist"
                />
                <NativeTabs.Trigger.Label>
                    {t('Задачи')}
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="habits">
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'flame', selected: 'flame.fill' }}
                    md="local_fire_department"
                />
                <NativeTabs.Trigger.Label>
                    {t('Привычки')}
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="planner">
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'calendar', selected: 'calendar' }}
                    md="calendar_month"
                />
                <NativeTabs.Trigger.Label>
                    {t('Календарь')}
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    )
}
