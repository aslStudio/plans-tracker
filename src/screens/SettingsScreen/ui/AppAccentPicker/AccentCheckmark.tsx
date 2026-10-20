import Svg, { Path } from 'react-native-svg'

export function AccentCheckmark() {
    return (
        <Svg
            width={17}
            height={17}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Path d="m4 12 5 5L20 6" />
        </Svg>
    )
}
