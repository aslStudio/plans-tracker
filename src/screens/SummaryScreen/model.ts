export type SummaryStat = {
    id: string
    label: string
    value: string
}

export type SummaryScreenProps = {
    stats: SummaryStat[]
    isLoading?: boolean
}
