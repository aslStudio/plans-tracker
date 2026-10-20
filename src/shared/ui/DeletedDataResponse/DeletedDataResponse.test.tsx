import { render } from '@/shared/lib/test-utils'
import { DeletedDataResponse } from './index'

jest.mock('expo-router', () => ({
    useRouter: () => ({ back: jest.fn() }),
}))

describe('DeletedDataResponse', () => {
    it('explains the data was deleted by default', () => {
        const { getByText } = render(<DeletedDataResponse />)

        expect(getByText('Эти данные были удалены')).toBeTruthy()
    })

    it('explains the data is simply unavailable when missing', () => {
        const { getByText } = render(<DeletedDataResponse missing />)

        expect(getByText('Данные недоступны')).toBeTruthy()
    })

    it('renders a header when shown full screen', () => {
        const { getByText } = render(<DeletedDataResponse fullScreen />)

        expect(getByText('Данные')).toBeTruthy()
    })
})
