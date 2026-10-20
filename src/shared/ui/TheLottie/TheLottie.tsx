import { t, useLanguage } from '@/shared/lib/i18n'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import { toByteArray } from 'base64-js'
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import LottieView, { type LottieViewProps } from 'lottie-react-native'
import { inflate } from 'pako'

type AnimationSource = NonNullable<LottieViewProps['source']>

type TheLottieProps = {
    /** A bundled `.tgs` asset, such as `lottie.streak` from `@/shared/config/lottie`. */
    source: number
    style?: StyleProp<ViewStyle>
    autoPlay?: boolean
    loop?: boolean
    speed?: number
    resizeMode?: LottieViewProps['resizeMode']
    onAnimationFinish?: LottieViewProps['onAnimationFinish']
    accessibilityLabel?: string
    onError?: (error: Error) => void
}

/** Loads a local Telegram `.tgs` animation and plays its unpacked Lottie data. */
export function TheLottie({
    source,
    style,
    autoPlay = true,
    loop = true,
    speed = 1,
    resizeMode = 'contain',
    onAnimationFinish,
    accessibilityLabel,
    onError,
}: TheLottieProps) {
    useLanguage()

    const [loaded, setLoaded] = useState<{
        source: number
        animation: AnimationSource
    } | null>(null)
    const onErrorRef = useRef(onError)

    useEffect(() => {
        onErrorRef.current = onError
    }, [onError])

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const asset = Asset.fromModule(source)
                await asset.downloadAsync()
                if (!asset.localUri)
                    throw new Error(t('Не удалось загрузить TGS-анимацию'))

                const encoded = await FileSystem.readAsStringAsync(
                    asset.localUri,
                    {
                        encoding: FileSystem.EncodingType.Base64,
                    },
                )
                const bytes = toByteArray(encoded)
                const json = inflate(bytes, { toText: true })
                const parsed = JSON.parse(json) as AnimationSource
                if (!cancelled) setLoaded({ source, animation: parsed })
            } catch (error) {
                if (!cancelled) {
                    onErrorRef.current?.(
                        error instanceof Error
                            ? error
                            : new Error(t('Ошибка загрузки TGS')),
                    )
                }
            }
        }

        void load()
        return () => {
            cancelled = true
        }
    }, [source])

    if (!loaded || loaded.source !== source) return <View style={style} />

    return (
        <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
            style={style}
        >
            <LottieView
                source={loaded.animation}
                autoPlay={autoPlay}
                loop={loop}
                speed={speed}
                resizeMode={resizeMode}
                onAnimationFinish={onAnimationFinish}
                style={StyleSheet.absoluteFill}
            />
        </View>
    )
}
