import type { Meta, StoryObj } from '@storybook/react-native'
import { useState } from 'react'
import { fn } from 'storybook/test'

import type { HabitCategory, TaskGroup, TaskPriority } from '@/shared/api'

import { SettingsScreen } from './SettingsScreen'
import type { SettingsScreenProps } from './model'

const INITIAL_GROUPS: TaskGroup[] = [
    { id: 'group-work', label: 'Работа', color: 'accent-blue', order: 0 },
    { id: 'group-home', label: 'Дом', color: 'accent-green', order: 1 },
]
const INITIAL_PRIORITIES: TaskPriority[] = [
    { id: 'priority-low', label: 'Низкий', order: 0, isBuiltIn: true },
    {
        id: 'priority-medium',
        label: 'Средний',
        color: 'accent-yellow',
        order: 1,
        isBuiltIn: true,
    },
    {
        id: 'priority-high',
        label: 'Высокий',
        color: 'accent-red',
        order: 2,
        isBuiltIn: true,
    },
]
const INITIAL_HABIT_CATEGORIES: HabitCategory[] = [
    { id: 'health', label: 'Здоровье', color: 'accent-green', order: 0 },
]

/** A real, in-memory implementation of the CRUD callbacks — static args would leave every toggle/add/edit a no-op, which defeats the point of poking at a settings screen in Storybook. */
function Example(
    props: Omit<
        SettingsScreenProps,
        | 'groups'
        | 'priorities'
        | 'habitCategories'
        | 'accentName'
        | 'themeMode'
        | 'onChangeThemeMode'
    >,
) {
    const [groups, setGroups] = useState(INITIAL_GROUPS)
    const [priorities, setPriorities] = useState(INITIAL_PRIORITIES)
    const [habitCategories, setHabitCategories] = useState(
        INITIAL_HABIT_CATEGORIES,
    )
    const [accentName, setAccentName] =
        useState<SettingsScreenProps['accentName']>('turquoise')
    const [themeMode, setThemeMode] =
        useState<SettingsScreenProps['themeMode']>('system')

    return (
        <SettingsScreen
            {...props}
            groups={groups}
            priorities={priorities}
            habitCategories={habitCategories}
            accentName={accentName}
            themeMode={themeMode}
            onChangeThemeMode={setThemeMode}
            onCreateGroup={(draft) =>
                setGroups((current) => [
                    ...current,
                    {
                        id: `group-${current.length}`,
                        order: current.length,
                        ...draft,
                    },
                ])
            }
            onUpdateGroup={(id, draft) =>
                setGroups((current) =>
                    current.map((g) => (g.id === id ? { ...g, ...draft } : g)),
                )
            }
            onDeleteGroup={(id) =>
                setGroups((current) => current.filter((g) => g.id !== id))
            }
            onCreatePriority={(draft) =>
                setPriorities((current) => [
                    ...current,
                    {
                        id: `priority-${current.length}`,
                        order: current.length,
                        isBuiltIn: false,
                        label: draft.label,
                        color: draft.color ?? undefined,
                    },
                ])
            }
            onUpdatePriority={(id, draft) =>
                setPriorities((current) =>
                    current.map((p) =>
                        p.id === id
                            ? {
                                  ...p,
                                  label: draft.label,
                                  color: draft.color ?? undefined,
                              }
                            : p,
                    ),
                )
            }
            onDeletePriority={(id) =>
                setPriorities((current) => current.filter((p) => p.id !== id))
            }
            onCreateHabitCategory={(draft) =>
                setHabitCategories((current) => [
                    ...current,
                    {
                        id: `habit-category-${current.length}`,
                        order: current.length,
                        label: draft.label,
                        color: draft.color ?? undefined,
                    },
                ])
            }
            onUpdateHabitCategory={(id, draft) =>
                setHabitCategories((current) =>
                    current.map((c) =>
                        c.id === id
                            ? {
                                  ...c,
                                  label: draft.label,
                                  color: draft.color ?? undefined,
                              }
                            : c,
                    ),
                )
            }
            onDeleteHabitCategory={(id) =>
                setHabitCategories((current) =>
                    current.filter((c) => c.id !== id),
                )
            }
            onChangeAccent={setAccentName}
        />
    )
}

const meta = {
    title: 'Screens/SettingsScreen',
    component: SettingsScreen,
    parameters: { noSafeArea: true },
    args: {
        useGroups: true,
        usePriority: true,
        groups: INITIAL_GROUPS,
        priorities: INITIAL_PRIORITIES,
        useHabitCategories: true,
        habitCategories: INITIAL_HABIT_CATEGORIES,
        accentName: 'turquoise',
        themeMode: 'system',
        onChangeThemeMode: fn(),
        onClose: fn(),
        onToggleGroups: fn(),
        onTogglePriority: fn(),
        onCreateGroup: fn(),
        onUpdateGroup: fn(),
        onDeleteGroup: fn(),
        onCreatePriority: fn(),
        onUpdatePriority: fn(),
        onDeletePriority: fn(),
        onToggleHabitCategories: fn(),
        onCreateHabitCategory: fn(),
        onUpdateHabitCategory: fn(),
        onDeleteHabitCategory: fn(),
        onChangeAccent: fn(),
    },
    argTypes: {
        groups: { control: false },
        priorities: { control: false },
        habitCategories: { control: false },
    },
} satisfies Meta<typeof SettingsScreen>

export default meta
type Story = StoryObj<typeof meta>

function PlaygroundExample(args: SettingsScreenProps) {
    const [useGroups, setUseGroups] = useState(args.useGroups)
    const [usePriority, setUsePriority] = useState(args.usePriority)
    const [useHabitCategories, setUseHabitCategories] = useState(
        args.useHabitCategories,
    )
    return (
        <Example
            {...args}
            useGroups={useGroups}
            usePriority={usePriority}
            useHabitCategories={useHabitCategories}
            onToggleGroups={setUseGroups}
            onTogglePriority={setUsePriority}
            onToggleHabitCategories={setUseHabitCategories}
        />
    )
}

export const Playground: Story = {
    name: 'Песочница',
    render: (args) => <PlaygroundExample {...args} />,
}
export const BothOff: Story = {
    name: 'Всё выключено',
    args: { useGroups: false, usePriority: false, useHabitCategories: false },
}
