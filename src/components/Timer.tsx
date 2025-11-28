import { Button, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { timeToString } from '../util';
import { ElapsedTime_FontSize, GreenColorCode, ReminningTime_FontSize, RoyalBlueColorCode } from '../types/constants';
import { TimerState } from '../datas/TimerState';


type TimerProps = {
    timerState: TimerState
    timerEnable: boolean
    onExpire: (elapsedTime: number) => void
    onDoneButtonClicked: (elapsedTime: number) => void
    onElapsedTimeChanged: (elapsedTime: number) => void
    onTick: (elapsedTime: number) => void
    pause: (elapsedTime: number) => void
    start: () => void
    reset: (now: number) => void
}
const getElapsedTime = (now: number, timeAtStarted: number | null, elapsedTimeUntilLastPaused: number) => {
    return timeAtStarted === null ? elapsedTimeUntilLastPaused
        : now - timeAtStarted + elapsedTimeUntilLastPaused
}
export default function Timer(props: TimerProps) {
    const {
        timerState,
        timerEnable,
        onDoneButtonClicked,
        onExpire,
        onElapsedTimeChanged,
        onTick,
        pause,
        start,
        reset,
    } = props;
    const [now, setNow] = useState(Date.now());
    const pausedOrRunning = timerState.timeAtStarted ? "running" : "paused"
    const elapsedTime = getElapsedTime(now, timerState.timeAtStarted, timerState.elapsedTimeUntilLastPaused)
    const remainTime = timerState.remainTime
    useEffect(() => {
        const id = setInterval(() => {
            onTick(elapsedTime)
            setNow(Date.now())
            if (pausedOrRunning === "running") {
                if ((elapsedTime > remainTime * 1000) && remainTime !== 0) {
                    onExpire(elapsedTime)
                }
            }
        }, 200);
        return () => {
            clearInterval(id)
        }
    }, [now])
    useEffect(() => {
        onElapsedTimeChanged(elapsedTime)
    }, [elapsedTime])
    const toggle = () => {
        if (pausedOrRunning === "running") pause(elapsedTime)
        else start()
    }
    //--------------------------↓renderpart-------------------------
    const renderTime = () => {
        const color = pausedOrRunning === "running" ? "primary" : GreenColorCode
        return (
            <Button
                sx={{ padding: 0, color: color }}
                disableRipple
                disabled={!timerEnable}
                onClick={
                    () => {
                        toggle()
                    }
                }>
                <Stack>
                    {renderElapsedTime()}
                    {renderRemainingTime()}
                </Stack>
            </Button>
        )
    }
    const renderElapsedTime = () => {
        return (
            <div style={{ fontSize: ElapsedTime_FontSize }}>
                <span>{timeToString(elapsedTime)}</span>
            </div>
        )
    }
    const renderRemainingTime = () => {
        return (
            <div style={{ fontSize: ReminningTime_FontSize }}>
                <span>{timeToString(remainTime * 1000)}</span>
            </div>
        )
    }
    const doneButton_core =
        <Button
            variant='outlined'
            disableElevation
            disableRipple
            disabled={!timerEnable}
            onClick={() => {
                onDoneButtonClicked(elapsedTime)
            }}
        >
            Done
        </Button>
    const doneButton_tip = (button: React.ReactElement) => button

    const doneButton = timerEnable ? doneButton_tip(doneButton_core) : doneButton_core
    return (
        <Stack direction={"row"}>
            <Stack direction={"column"} sx={{ flexGrow: 1 }}>
                {renderTime()}
                <Stack marginTop={1} direction={"row"} justifyContent={"space-evenly"}>
                    <Button
                        size='small'
                        disabled={!timerEnable}
                        variant='outlined'
                        disableElevation
                        disableRipple
                        onClick={() => {
                            reset(now);
                        }}>Reset</Button>
                    {doneButton}
                </Stack>
            </Stack>
        </Stack>
    );
}