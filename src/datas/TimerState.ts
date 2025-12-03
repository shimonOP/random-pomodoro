export type TimerState = {
    elapsedTimeUntilLastPaused: number
    timeAtStarted: number | null
    remainTime: number
}
export function calcEndTime(timerState: TimerState): number | null {
    if (timerState.timeAtStarted === null) return null
    // 新しい終了時間を計算
    const endTime = - timerState.elapsedTimeUntilLastPaused + timerState.remainTime*1000 + timerState.timeAtStarted!;
    return endTime
}
export function createTimerState(data?: Partial<TimerState>) {
    const d: TimerState = {
        elapsedTimeUntilLastPaused: 0,
        timeAtStarted: null,
        remainTime: 0,
    }
    return data ? Object.assign(d, data) : d
}