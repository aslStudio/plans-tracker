import { DONE_STATUS_ID, TODO_STATUS_ID } from '@/shared/api'
import { render } from '@/shared/lib/test-utils'

import { TaskRadio } from './TaskRadio'

const todoStatus = {
    id: TODO_STATUS_ID,
    label: 'К выполнению',
    order: 0,
    isCompleted: false,
    isBuiltIn: true,
}

const doneStatus = {
    id: DONE_STATUS_ID,
    label: 'Готово',
    color: 'accent-green' as const,
    order: 1,
    isCompleted: true,
    isBuiltIn: true,
}

describe('TaskRadio', () => {
    it('renders a solid red ring when overdue, regardless of status', () => {
        const { toJSON } = render(<TaskRadio status={doneStatus} isOverdue />)

        const view = toJSON()
        expect(Array.isArray(view) ? view[0] : view).toMatchObject({
            props: expect.objectContaining({
                style: expect.arrayContaining([
                    expect.objectContaining({ borderWidth: 2 }),
                ]),
            }),
        })
    })

    it('renders a checkmark when the status is completed', () => {
        const { UNSAFE_getByProps } = render(
            <TaskRadio status={doneStatus} isOverdue={false} />,
        )

        expect(UNSAFE_getByProps({ name: 'check-outline' })).toBeTruthy()
    })

    it('renders a plain gray ring for the built-in todo status', () => {
        const { toJSON } = render(
            <TaskRadio status={todoStatus} isOverdue={false} />,
        )

        expect(toJSON()).toBeTruthy()
    })
})
