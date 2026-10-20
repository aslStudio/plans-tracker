import {
    Easing,
    FadeIn,
    FadeOut,
    LinearTransition,
    ReduceMotion,
} from 'react-native-reanimated'

export const layoutTiming = {
    duration: 300,
    easing: Easing.bezier(0.22, 0.68, 0, 1),
    reduceMotion: ReduceMotion.System,
}

export const graphTiming = { ...layoutTiming, duration: 440 }
export const listLayout = LinearTransition.duration(layoutTiming.duration)
    .easing(layoutTiming.easing)
    .reduceMotion(ReduceMotion.System)
export const listEnter = FadeIn.duration(200).reduceMotion(ReduceMotion.System)
export const listExit = FadeOut.duration(140).reduceMotion(ReduceMotion.System)
