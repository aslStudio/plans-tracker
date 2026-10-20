/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories need require(), not import */
import 'react-native-gesture-handler/jestSetup'

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('react-native-reanimated', () => ({
    ...require('react-native-reanimated/mock'),
    useReducedMotion: () => false,
    // The bundled mock's `useAnimatedKeyboard` returns `{ height: 0 }` — a
    // plain number, not a shared value — so any `.get()` call on it (same
    // API the real hook's `height` exposes) throws. Shape it like the real
    // thing instead of touching every call site.
    useAnimatedKeyboard: () => ({
        height: { get: () => 0, set: () => {} },
        state: { get: () => 0, set: () => {} },
    }),
}))

// `expo-crypto`'s `randomUUID` is a native binding with no JS fallback —
// stub it with an incrementing id so repository tests get distinct,
// deterministic ids instead of a resolution error.
jest.mock('expo-crypto', () => {
    let counter = 0
    return { randomUUID: () => `test-uuid-${++counter}` }
})

jest.mock(
    'react-native-safe-area-context',
    () => require('react-native-safe-area-context/jest/mock').default,
)

// Native-only date picker — the `.ios.tsx`/`.tsx` `DateField` split both
// mount it (or its imperative `DateTimePickerAndroid.open`) for real, so it
// needs to resolve to something inert rather than a native binding error.
jest.mock('@react-native-community/datetimepicker', () => {
    const { View } = require('react-native')
    return {
        __esModule: true,
        default: View,
        DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
    }
})

// Liquid Glass is iOS-26-only native functionality with no JS fallback — force
// it "off" in tests so shared UI components consistently exercise the plain
// Pressable/fallback rendering path everywhere, regardless of Jest's default
// haste platform (which resolves `.ios.tsx` files).
jest.mock('expo-glass-effect', () => ({
    isGlassEffectAPIAvailable: () => false,
    isLiquidGlassAvailable: () => false,
    GlassView: 'GlassView',
    GlassContainer: 'GlassContainer',
}))

jest.mock('expo-blur', () => {
    const { View } = require('react-native')
    return { BlurView: View }
})

// `@expo/ui/swift-ui` is a native-only module; it's never actually invoked in
// tests (glass is forced off above), but the `.ios.tsx` files still import it
// at module-load time, so it needs to resolve to *something*.
jest.mock('@expo/ui/swift-ui', () => {
    const { createElement } = require('react')
    const { Text: RNText, View } = require('react-native')
    // `Menu`'s trigger lives in its `label` *prop*, not `children` — a bare
    // `View` mock (which only renders `children`) would silently drop it,
    // making the trigger unqueryable in tests. Render both.
    function MockMenu({
        label,
        children,
    }: {
        label?: unknown
        children?: unknown
    }) {
        return createElement(View, null, label, children)
    }
    return {
        Button: View,
        Host: View,
        Menu: MockMenu,
        RNHostView: View,
        Text: RNText,
    }
})
// `react-native-enriched-html`'s `EnrichedTextInput` is a Fabric native
// component — nothing a JSDOM-less RNTL render can mount. Stand in with a
// plain `TextInput` driving the same `onChangeHtml`/`onFocus`/`onBlur`
// events, and an imperative handle whose toggle methods are no-ops (tests
// exercise that pressing a toolbar button *calls* the right method, not that
// the native editor actually reformats text — that's the library's job).
jest.mock('react-native-enriched-html', () => {
    const React = require('react')
    const { TextInput, Text } = require('react-native')

    const EnrichedTextInput = React.forwardRef(
        (
            {
                defaultValue,
                onChangeHtml,
                onChangeText,
                onChangeSelection,
                onFocus,
                onBlur,
                placeholder,
                placeholderTextColor,
                style,
            }: {
                defaultValue?: string
                onChangeHtml?: (e: { nativeEvent: { value: string } }) => void
                onChangeText?: (e: { nativeEvent: { value: string } }) => void
                onChangeSelection?: (e: {
                    nativeEvent: {
                        start: number
                        end: number
                        text: string
                    }
                }) => void
                onFocus?: () => void
                onBlur?: () => void
                placeholder?: string
                placeholderTextColor?: string
                style?: object
            },
            ref: React.Ref<unknown>,
        ) => {
            const [value, setValue] = React.useState(defaultValue ?? '')
            React.useImperativeHandle(ref, () => ({
                focus: () => {},
                blur: () => {},
                setValue,
                setSelection: () => {},
                getHTML: async () => value,
                toggleBold: () => {},
                toggleItalic: () => {},
                toggleUnderline: () => {},
                toggleStrikeThrough: () => {},
                toggleInlineCode: () => {},
                toggleH1: () => {},
                toggleH2: () => {},
                toggleH3: () => {},
                toggleH4: () => {},
                toggleH5: () => {},
                toggleH6: () => {},
                toggleCodeBlock: () => {},
                toggleBlockQuote: () => {},
                toggleOrderedList: () => {},
                toggleUnorderedList: () => {},
                toggleCheckboxList: () => {},
                setLink: () => {},
                removeLink: () => {},
                setImage: () => {},
                startMention: () => {},
                setMention: () => {},
                setTextAlignment: () => {},
            }))
            return React.createElement(TextInput, {
                testID: 'rich-text-editor-input',
                placeholder,
                placeholderTextColor,
                value,
                style,
                onFocus,
                onBlur,
                onChangeText: (text: string) => {
                    setValue(text)
                    onChangeText?.({ nativeEvent: { value: text } })
                    onChangeHtml?.({ nativeEvent: { value: text } })
                },
                onSelectionChange: (e: {
                    nativeEvent: { selection: { start: number; end: number } }
                }) => {
                    const { start, end } = e.nativeEvent.selection
                    onChangeSelection?.({
                        nativeEvent: {
                            start,
                            end,
                            text: value.slice(start, end),
                        },
                    })
                },
            })
        },
    )

    const EnrichedText = ({ children }: { children?: string }) =>
        React.createElement(Text, null, children)

    EnrichedTextInput.displayName = 'MockEnrichedTextInput'
    return { EnrichedTextInput, EnrichedText }
})

jest.mock('@expo/ui/swift-ui/modifiers', () => ({
    accessibilityHint: () => ({}),
    accessibilityIdentifier: () => ({}),
    accessibilityLabel: () => ({}),
    accessibilityValue: () => ({}),
    buttonBorderShape: () => ({}),
    buttonStyle: () => ({}),
    clipShape: () => ({}),
    controlSize: () => ({}),
    disabled: () => ({}),
    frame: () => ({}),
    onLongPressGesture: () => ({}),
    tint: () => ({}),
}))

jest.mock('expo-localization', () => ({
    getLocales: () => [{ languageCode: 'ru', languageTag: 'ru-RU' }],
}))
