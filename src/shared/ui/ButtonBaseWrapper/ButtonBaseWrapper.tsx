import { hapticTap } from '@/shared/lib/haptics'

import { ButtonBaseWrapper as FallbackButton } from './ButtonBaseWrapperFallback'
import type { ButtonBaseWrapperProps } from './model'

export function ButtonBaseWrapper(props: ButtonBaseWrapperProps) {
    const onPress = props.onPress
        ? () => {
              hapticTap()
              props.onPress?.()
          }
        : props.onPress

    return <FallbackButton {...props} onPress={onPress} />
}
