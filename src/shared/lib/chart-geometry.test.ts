import { linePath, pointOnChart } from './chart-geometry'

it('keeps the selected marker exactly on the moving data point', () => {
    for (const progress of [0, 0.1, 0.5, 0.9, 1]) {
        const points = [
            { x: 14, y: 87 },
            { x: 150, y: 87 - 75 * progress },
            { x: 286, y: 12 },
        ]
        expect(pointOnChart(points, 1)).toEqual(points[1])
    }
})

it('moves selection along the same cubic curve as the rendered line', () => {
    const points = [
        { x: 0, y: 80 },
        { x: 100, y: 20 },
    ]
    expect(linePath(points)).toBe('M 0 80 C 50 80, 50 20, 100 20')
    expect(pointOnChart(points, 0.25)).toEqual({ x: 29.6875, y: 70.625 })
    expect(pointOnChart(points, 0.5)).toEqual({ x: 50, y: 50 })
})

it('never overshoots the end points', () => {
    const points = [
        { x: 0, y: 87 },
        { x: 100, y: 12 },
    ]
    expect(pointOnChart(points, -1)).toEqual(points[0])
    expect(pointOnChart(points, 2)).toEqual(points[1])
    for (let i = 0; i <= 100; i++) {
        const point = pointOnChart(points, i / 100)
        expect(point.x).toBeGreaterThanOrEqual(0)
        expect(point.x).toBeLessThanOrEqual(100)
        expect(point.y).toBeGreaterThanOrEqual(12)
        expect(point.y).toBeLessThanOrEqual(87)
    }
})
