export type TimerState = {
    elapsedTimeUntilLastPaused: number
    timeAtStarted: number | null
    remainTime: number
}
export function createTimerState(data?: Partial<TimerState>) {
    const d: TimerState = {
        elapsedTimeUntilLastPaused: 0,
        timeAtStarted: null,
        remainTime: 0,
    }
    return data ? Object.assign(d, data) : d
}