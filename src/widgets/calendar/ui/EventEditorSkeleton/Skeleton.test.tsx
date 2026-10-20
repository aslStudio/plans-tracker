import { render, screen } from '@/shared/lib/test-utils'

import { EventEditorSkeleton } from './Skeleton'

describe('EventEditorSkeleton', () => {
    it('shows the "new" header title', () => {
        render(<EventEditorSkeleton isNew onClose={() => {}} />)

        expect(screen.getByText('Новый план')).toBeTruthy()
    })

    it('shows the "existing" header title', () => {
        render(<EventEditorSkeleton isNew={false} onClose={() => {}} />)

        expect(screen.getByText('План')).toBeTruthy()
    })
})
