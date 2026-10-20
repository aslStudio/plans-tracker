import { View } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import { type MonoIconName, monoIcons, multiIcons } from '@/shared/config/icons'
import { useThemeColor } from '@/shared/lib/theme/use-theme-color'
import { DefaultTextColor } from '@/shared/ui/TheText/model'

import type { IconProps } from './model'
import { useStyles } from './styles'

export function Icon(props: IconProps) {
    const { style, name, size = 24, width, height, testID } = props
    const styles = useStyles(props.size || 24)
    const resolvedThemeColor = useThemeColor(props.color ?? DefaultTextColor)

    // --- MONO ---
    if (Object.hasOwn(monoIcons, name)) {
        const Svg = monoIcons[name as MonoIconName]
        const resolvedColor = props.nativeColor ?? resolvedThemeColor

        const svgProps: SvgProps = {
            width: width ?? size,
            height: height ?? size,
            testID,
            ...(resolvedColor
                ? {
                      color: resolvedColor,
                  }
                : null),
        }

        return (
            <View
                style={[styles.root, style]}
                pointerEvents={props.pointerEvents}
            >
                <Svg {...svgProps} />
            </View>
        )
    }

    // --- MULTI ---
    const Svg = Object.hasOwn(multiIcons, name)
        ? (
              multiIcons as Partial<
                  Record<string, React.ComponentType<SvgProps>>
              >
          )[name]
        : undefined

    if (!Svg) {
        throw new Error(`Icon ${name} not found`)
    }

    return (
        <View style={[styles.root, style]} pointerEvents={props.pointerEvents}>
            <Svg
                width={width ?? size}
                height={height ?? size}
                testID={testID}
            />
        </View>
    )
}
