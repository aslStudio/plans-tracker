import { fireEvent } from '@testing-library/react-native'
import { useState } from 'react'

import type { HabitCompletion } from '@/shared/api'
import { addDays, formatShortDate, todayDateString } from '@/shared/lib/date'
import { render, screen, waitFor } from '@/shared/lib/test-utils'

import { HabitsScreen } from './HabitsScreen'

type MockTrigger = import('react').ReactElement<{ onPress: () => void }>

jest.mock('@/shared/ui/NativeMenu', () => ({
    NativeMenu: ({
        trigger,
        items,
    }: import('@/shared/ui/NativeMenu').NativeMenuProps) => {
        const React = jest.requireActual<typeof import('react')>('react')
        const { Pressable, Text, View } =
            jest.requireActual<typeof import('react-native')>('react-native')
        const [open, setOpen] = React.useState(false)
        return (
            <View>
                {React.cloneElement(trigger as MockTrigger, {
                    onPress: () => setOpen(!open),
                })}
                {open &&
                    items.map((item) => (
                        <Pressable
                            key={item.key}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                            onPress={() => {
                                item.onPress()
                                setOpen(false)
                            }}
                        >
                            <Text>{item.label}</Text>
                        </Pressable>
                    ))}
            </View>
        )
    },
}))

const now = new Date().toISOString()

const CATEGORIES = [
    {
        id: 'health',
        label: 'Здоровье',
        order: 0,
        color: 'accent-green' as const,
    },
]

const habit = {
    id: '1',
    title: 'Пить воду',
    categoryId: 'health',
    repeat: { type: 'daily' as const },
    createdAt: now,
    updatedAt: now,
}

const noop = () => {}

function renderScreen(
    overrides: Partial<Parameters<typeof HabitsScreen>[0]> = {},
) {
    return render(
        <HabitsScreen
            habits={[]}
            categories={[]}
            useCategories={false}
            completionsByHabitId={{}}
            onAddHabit={noop}
            onOpenHabit={noop}
            onDeleteHabit={noop}
            onToggleCompletion={noop}
            onOpenSettings={noop}
            onOpenStreak={noop}
            {...overrides}
        />,
    )
}

describe('HabitsScreen', () => {
    it('renders the empty state when there are no habits', () => {
        renderScreen()

        expect(screen.getByText('Найдите свой ритм')).toBeTruthy()
    })

    it('renders a habit row', () => {
        renderScreen({ habits: [habit] })

        expect(screen.getByText('Пить воду')).toBeTruthy()
        expect(screen.queryByText('Найдите свой ритм')).toBeNull()
    })

    it('calls onOpenHabit when a habit row is pressed', () => {
        const onOpenHabit = jest.fn()
        renderScreen({ habits: [habit], onOpenHabit })

        fireEvent.press(screen.getByText('Пить воду'))

        expect(onOpenHabit).toHaveBeenCalledWith('1')
    })

    it('calls onToggleCompletion for the selected date', () => {
        const onToggleCompletion = jest.fn()
        renderScreen({ habits: [habit], onToggleCompletion })

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Отметить выполненной сегодня',
            }),
        )

        expect(onToggleCompletion).toHaveBeenCalledWith('1', todayDateString())
    })

    it('celebrates when the last due habit is completed', async () => {
        const today = todayDateString()
        const completion: HabitCompletion = {
            id: 'completion-1',
            habitId: '1',
            occurrenceDate: today,
            completedAt: `${today}T12:00:00.000Z`,
        }
        function InteractiveScreen() {
            const [isDone, setIsDone] = useState(false)
            return (
                <HabitsScreen
                    habits={[{ ...habit, createdAt: `${today}T08:00:00.000Z` }]}
                    categories={[]}
                    useCategories={false}
                    completionsByHabitId={isDone ? { '1': [completion] } : {}}
                    isLoading={false}
                    onAddHabit={noop}
                    onOpenHabit={noop}
                    onDeleteHabit={noop}
                    onToggleCompletion={() => setIsDone(true)}
                    onOpenSettings={noop}
                    onOpenStreak={noop}
                />
            )
        }

        render(<InteractiveScreen />)
        fireEvent.press(
            screen.getByRole('button', {
                name: 'Отметить выполненной сегодня',
            }),
        )

        await waitFor(() =>
            expect(screen.getByText('Все привычки выполнены!')).toBeTruthy(),
        )
        expect(screen.getByText(/Серия выросла: 1 день подряд/)).toBeTruthy()
        expect(screen.getByText('Отлично!')).toBeTruthy()
    })

    it('shows the streak chart instead of the plain daily percentage', () => {
        renderScreen({ habits: [habit] })

        expect(screen.getByText('Серия привычек')).toBeTruthy()
        expect(screen.getByText('Сегодня')).toBeTruthy()
        expect(screen.queryByText('Выполнено 0%')).toBeNull()
    })

    it('opens the all-habits streak screen when the chart card is pressed', () => {
        const onOpenStreak = jest.fn()
        renderScreen({ habits: [habit], onOpenStreak })

        fireEvent.press(screen.getByRole('button', { name: /Серия привычек/ }))

        expect(onOpenStreak).toHaveBeenCalledTimes(1)
    })

    it('selects a chart day and changes the habit list to that date', () => {
        const yesterday = addDays(todayDateString(), -1)
        const onToggleCompletion = jest.fn()
        renderScreen({
            habits: [{ ...habit, createdAt: `${yesterday}T00:00:00` }],
            onToggleCompletion,
        })

        fireEvent(screen.getByTestId('habit-streak-chart'), 'layout', {
            nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 118 } },
        })
        fireEvent.press(
            screen.getByRole('button', {
                name: new RegExp(`Выбрать ${formatShortDate(yesterday)}`),
            }),
        )

        expect(screen.queryByText(/привычки$/)).toBeNull()
        expect(
            screen.getByRole('button', {
                name: `Отметить выполненной ${formatShortDate(yesterday)}`,
            }),
        ).toBeTruthy()
        fireEvent.press(
            screen.getByRole('button', {
                name: `Отметить выполненной ${formatShortDate(yesterday)}`,
            }),
        )
        expect(onToggleCompletion).toHaveBeenCalledWith('1', yesterday)
    })

    it('hides the category label when the setting is off', () => {
        renderScreen({
            habits: [habit],
            categories: CATEGORIES,
            useCategories: false,
        })

        expect(screen.queryByText('Здоровье')).toBeNull()
    })

    it('shows the category label once the setting is on', () => {
        renderScreen({
            habits: [habit],
            categories: CATEGORIES,
            useCategories: true,
        })

        expect(screen.getByText('Здоровье')).toBeTruthy()
    })

    it('calls onOpenSettings when the gear button is pressed', () => {
        const onOpenSettings = jest.fn()
        renderScreen({ onOpenSettings })

        fireEvent.press(screen.getByRole('button', { name: 'Настройки' }))

        expect(onOpenSettings).toHaveBeenCalledTimes(1)
    })
})

it('filters habits by category and restores all habits when categories are disabled', () => {
    const other = { ...habit, id: '2', title: 'Читать', categoryId: null }
    const { rerender } = renderScreen({
        habits: [habit, other],
        categories: CATEGORIES,
        useCategories: true,
    })
    fireEvent.press(
        screen.getByRole('button', { name: 'Фильтр по категориям' }),
    )
    fireEvent.press(screen.getByRole('button', { name: 'Без категории' }))
    expect(screen.queryByText('Пить воду')).toBeNull()
    expect(screen.getByText('Читать')).toBeTruthy()
    rerender(
        <HabitsScreen
            habits={[habit, other]}
            categories={CATEGORIES}
            useCategories={false}
            completionsByHabitId={{}}
            onAddHabit={noop}
            onOpenHabit={noop}
            onDeleteHabit={noop}
            onToggleCompletion={noop}
            onOpenSettings={noop}
            onOpenStreak={noop}
        />,
    )
    expect(screen.getByText('Пить воду')).toBeTruthy()
    expect(screen.getByText('Читать')).toBeTruthy()
})

it('opens statistics from the card below habits with the selected category', () => {
    const onOpenStatistics = jest.fn()
    renderScreen({
        habits: [habit],
        categories: CATEGORIES,
        useCategories: true,
        onOpenStatistics,
    })
    fireEvent.press(
        screen.getByRole('button', { name: 'Фильтр по категориям' }),
    )
    fireEvent.press(screen.getByRole('button', { name: 'Здоровье' }))
    fireEvent.press(screen.getByText('Статистика привычек'))
    expect(onOpenStatistics).toHaveBeenCalledWith('health')
})
