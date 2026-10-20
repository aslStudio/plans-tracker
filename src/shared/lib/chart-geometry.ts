export type ChartPoint = { x: number; y: number }

export function linePath(points: ChartPoint[]) {
    'worklet'
    return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`
        const previous = points[index - 1]
        const midX = (previous.x + point.x) / 2
        return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
    }, '')
}

/** Sample exactly the same Bézier curve that the line renders. */
export function pointOnChart(
    points: ChartPoint[],
    position: number,
): ChartPoint {
    'worklet'
    if (!points.length) return { x: 0, y: 0 }
    const clamped = Math.max(0, Math.min(points.length - 1, position))
    const index = Math.floor(clamped)
    const start = points[index]
    const end = points[Math.min(index + 1, points.length - 1)]
    const t = clamped - index
    const u = 1 - t
    const midX = (start.x + end.x) / 2
    return {
        x: u ** 3 * start.x + 3 * u * t * midX + t ** 3 * end.x,
        y: start.y + (end.y - start.y) * (3 * t * t - 2 * t ** 3),
    }
}
