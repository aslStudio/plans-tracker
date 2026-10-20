import { act } from '@testing-library/react-native'

import { showAppToast } from '@/shared/lib/toast/app-toast'
import { render, screen } from '@/shared/lib/test-utils'

import { AppToastHost } from './AppToastHost'

describe('AppToastHost', () => {
    it('shows the successful creation toast', () => {
        render(<AppToastHost />)

        act(() =>
            showAppToast({
                title: 'Задача добавлена',
                description: 'Она уже в вашем списке',
            }),
        )

        expect(screen.getByText('Задача добавлена')).toBeTruthy()
        expect(screen.getByText('Она уже в вашем списке')).toBeTruthy()
    })

    it('uses the done animation for a successful deletion toast', () => {
        render(<AppToastHost />)

        act(() =>
            showAppToast({
                title: 'План удалён',
                description: 'Он удалён из календаря',
                animation: 'done',
            }),
        )

        expect(screen.getByText('План удалён')).toBeTruthy()
        expect(screen.getByLabelText('Удалено')).toBeTruthy()
    })
})
