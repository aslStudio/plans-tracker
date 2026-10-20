export type Color =
    | 'brand'
    | 'brandSecondary'
    | 'accent-turquoise'
    | 'accent-red'
    | 'accent-orange'
    | 'accent-yellow'
    | 'accent-green'
    | 'accent-blue'
    | 'accent-indigo'
    | 'accent-pink'
    | 'labels-primary'
    | 'labels-secondary'
    | 'labels-tertiary'
    | 'gray-black'
    | 'gray-white'
    | 'gray-gray'
    | 'background-primary'
    | 'background-secondary'
    | 'background-elevated'

/** The accent-only subset of `Color` — for things like task groups that must pick one of the app's accent swatches specifically, not any theme color. */
export type AccentColor = Extract<Color, `accent-${string}`>

export const AccentColorValues: AccentColor[] = [
    'accent-turquoise',
    'accent-red',
    'accent-orange',
    'accent-yellow',
    'accent-green',
    'accent-blue',
    'accent-indigo',
    'accent-pink',
]

export const ColorValues: Color[] = [
    'brand',
    'brandSecondary',
    'accent-turquoise',
    'accent-red',
    'accent-orange',
    'accent-yellow',
    'accent-green',
    'accent-blue',
    'accent-indigo',
    'accent-pink',
    'labels-primary',
    'labels-secondary',
    'labels-tertiary',
    'gray-black',
    'gray-white',
    'gray-gray',
    'background-primary',
    'background-secondary',
    'background-elevated',
]
