import { Add, Download, Remove, Start } from "@mui/icons-material"
import { Link, Tooltip, Card, Stack, Typography, Slider, Box, Button, SxProps, Theme } from "@mui/material"
import { Card_PaddingX, Card_PaddingY, GreenColorCode, IntervalInTimer_Height, TimerTitle_FontSize, TodayTotalTimeR_FontSize, TodayTotalTime_FontSize, timerRuntimeSliderMarks } from "../types/constants"
import { extractTime, probsToString, timeToString } from "../util"
import { todaysTotal, uniqueExecuter_notify, uniqueExecuter_autoDoTimer } from "../AppCore_"
import { Todo, isInInterval } from "../datas/Todo"
import { TodoRecord, getRecordsToday } from "../datas/TodoRecord"
import Notifier from "../types/Notifier"
import RollDiceIcon from "./RollDiceIcon"
import TagsSelect from "./TagsSelect"
import TodoBreadCrumbs from "./TodoBreadCrumbs"
import { TimerState } from "../datas/TimerState"
import { TodoFuture } from "../datas/TodoPlan"
import { UserSettings } from "../datas/UserSettings"
import { useContext, useEffect } from "react"
import { TLLContext } from "../App"
import Timer from "./Timer"
import CasinoIcon from '@mui/icons-material/Casino';

let lastNotifyTime: number = 0
let doingAutoTimerStatus: "stable" | "doingAutoTimer" = "stable" // doAutoTimerを一回しか発生しないようにするためのもの。

export function TimerPane(props: {
  runningTodo: Todo | undefined,
  rollDice: () => void,
  setFocusedTodo: (todo: Todo | undefined) => void,
  expandTreeView: (id: string, expand: boolean, recursive: boolean) => void,
  timerState: TimerState,
  setTimerState: (timerState: TimerState) => void,
  done: (elapsedTime: number) => void,
  setRunningTodo_withProc: (todo: Todo | undefined, isCompleted?: boolean, needDelete?: boolean) => void,
  setTodoParameter: (id: string, param: { interval?: number }) => void,
  sliderRunTime: number,
  setSliderRunTime: (value: number) => void,
  sliderInterval: number,
  sliderIntervalUnit: "Min" | "Day",
  sliderIntervalCoeff: number,
  sliderIntervalMax: number,
  setSliderInterval: (value: number) => void,
  setSliderIntervalUnit: (value: "Min" | "Day") => void,
  todos: Map<string, Todo>,
  records: TodoRecord[],
  setRecords: (records: TodoRecord[]) => void,
  todoFutures: TodoFuture[],
  setTodoFutures: (todoFutures: TodoFuture[]) => void,
  tags: string[],
  userSettings: UserSettings,
  setUserSettings: () => void,
  settingsButton: JSX.Element,
  isSynchronizing: boolean,
  intervalString: string,
  rProbs: number[],
  timerIntervalSliderMarks: { value: number, label: string }[],
  timerPaneWidth: number,
  isDiceRolling: boolean,
  rollDiceDisabled: boolean,
}) {
  const {
    runningTodo,
    rollDice,
    setFocusedTodo,
    expandTreeView,
    timerState,
    setTimerState,
    done,
    setRunningTodo_withProc,
    setTodoParameter,
    sliderRunTime,
    setSliderRunTime,
    sliderInterval,
    sliderIntervalUnit,
    sliderIntervalCoeff,
    sliderIntervalMax,
    setSliderInterval,
    setSliderIntervalUnit,
    todos,
    records,
    todoFutures,
    setTodoFutures,
    tags,
    userSettings,
    setUserSettings,
    settingsButton,
    isSynchronizing,
    intervalString,
    rProbs,
    timerIntervalSliderMarks,
    timerPaneWidth,
    isDiceRolling,
    rollDiceDisabled,
  } = props;
  const tll = useContext(TLLContext);
  useEffect(() => {
    doingAutoTimerStatus = "stable"
  }, [runningTodo])
  const renderTitle = () => {
    let title: string;
    let sx: SxProps<Theme> = {};
    if (!runningTodo) {
      title = '-- -- --';
    } else {
      title = runningTodo.displayTitle
      if (runningTodo.isCompleted) {
        sx = { ...sx, textDecorationLine: "line-through", textDecorationStyle: "solid" }
      }
      if (isInInterval(runningTodo, new Date())) {
        sx = { ...sx, color: GreenColorCode }
      }
    }
    const fsize = TimerTitle_FontSize(title);

    return (
      <Stack minHeight={50} maxHeight={50} justifyContent="center">
        <Button disableRipple onClick={() => {
          setFocusedTodo(runningTodo)
          if (runningTodo) expandTreeView(runningTodo.id, true, true);
        }} disabled={!Boolean(runningTodo)}>
          <Typography sx={sx} color={"inherit"} fontSize={fsize} >{title}</Typography>
        </Button>
      </Stack>
    )

  }
  const renderInfo_r = () => {
    const container = (contain: JSX.Element) => (
      <Box
        minHeight={15}
        maxHeight={15}
      >{contain}</Box>)
    if (runningTodo) {
      return container(
        <Box
          sx={{
            textAlign: "left",
            color: "#00000099",
            fontSize: TodayTotalTimeR_FontSize
          }}>
          {todaysTotal(runningTodo, records) + ", " + probsToString(rProbs)}
        </Box>
      )
    }
    return container(<></>)
  }
  const notUntilUI =
    <Box minHeight={IntervalInTimer_Height} maxHeight={IntervalInTimer_Height}>
      <Typography sx={{ m: 2 }} color={GreenColorCode}>{intervalString}</Typography>
    </Box>;
  const renderRollDiceButton = () => {
    return (
      <Tooltip title={
        <Stack spacing={0.3} direction={"column"} justifyContent={"center"}>
          <Link textAlign={"center"} style={{ color: "white" }} component={"button"} onClick={() => { rollDice() }}>{tll.t("RollDice")}</Link>
        </Stack>}>
        <Box >
          <Button
            fullWidth
            disableRipple={true}
            color="secondary"
            onClick={async () => {
              if (rollDiceDisabled) return;
              rollDice();
            }}
            style={{}}
          >
            <RollDiceIcon
              isRolling={isDiceRolling}
            ></RollDiceIcon>
          </Button>
        </Box>
      </Tooltip>
    )
  }
  const renderTimer = () => {

    return (
      <Timer
        timerState={timerState}
        pause={(elapsedTime: number) => {
          setTimerState({
            ...timerState,
            elapsedTimeUntilLastPaused: elapsedTime,
            timeAtStarted: null,
          }
          )
        }}
        reset={(now) => {
          setTimerState({
            ...timerState,
            elapsedTimeUntilLastPaused: 0,
            timeAtStarted: now,
          }
          )
        }}
        start={() => {
          setTimerState({
            ...timerState,
            timeAtStarted: Date.now(),
          }
          )
        }}
        timerEnable={runningTodo !== undefined}
        onExpire={(elapsedTime: number) => {
          const now = Date.now()
          if (runningTodo !== undefined) {
            if (now - lastNotifyTime > 20 * 1000) {
              uniqueExecuter_notify.run(() => {
                Notifier.instance.notifyEnd(runningTodo.displayTitle, userSettings.language, userSettings.notifyVolume);
                lastNotifyTime = now
              })
            }
            if (userSettings.doAutoTimer && (doingAutoTimerStatus === "stable") && false) {//まだ不具合多数
              doingAutoTimerStatus = "doingAutoTimer"
              uniqueExecuter_autoDoTimer.run(() => {
                done(elapsedTime);
                rollDice();
              })
            }
          }
        }}
        onDoneButtonClicked={(elapsedTime: number) => {
          done(elapsedTime)
        }}
        onElapsedTimeChanged={(displayTime: number) => {
          if (runningTodo && !isSynchronizing) {
            document.title = timeToString(displayTime) + "  " + runningTodo.displayTitle;
          }
        }}
        onTick={(displayTime: number) => {
        }}
      ></Timer >
    )
  }
  const renderTodaysTotal = () => {
    const sumMin = getRecordsToday(records).map(d => d.runTime).reduce((a, b) => a + b, 0) / 60;
    const hour = extractTime(sumMin, "minutes", "hours");
    const min = extractTime(sumMin, "minutes", "minutes");
    const displayStr = "Today: " + hour + "h" + min + "m"
    return (<Typography fontSize={TodayTotalTime_FontSize}>
      {displayStr}
    </Typography>)
  }
  const tagsSelect = (
    userSettings.doRestrictByTags ?
      <Stack >
        <TagsSelect
          labelWhenTagsEmpty='*all'
          placeHolder='Inclusion Tags'
          handleDelete={(tag: string) => {
            userSettings.timerTags = userSettings.timerTags.filter((t) => t !== tag);
            setUserSettings();
          }}
          onChange={(tag: string) => {
            if (!userSettings.timerTags.some(t => t === tag)) {
              userSettings.timerTags.push(tag);
              setUserSettings();
            }
            return "";
          }}
          tags={userSettings.timerTags}
          allTags={tags}
          icon={<Add></Add>}
        ></TagsSelect>
        <TagsSelect
          labelWhenTagsEmpty=''
          placeHolder='Exclusion Tags'
          handleDelete={(tag: string) => {
            userSettings.timerExTags = userSettings.timerExTags.filter((t) => t !== tag);
            setUserSettings();
          }}
          onChange={(tag: string) => {
            if (!userSettings.timerExTags.some(t => t === tag)) {
              userSettings.timerExTags.push(tag);
              setUserSettings();
            }
            return "";
          }}
          tags={userSettings.timerExTags}
          allTags={tags}
          icon={<Remove></Remove>}
        ></TagsSelect>
      </Stack> :
      <></>
  )
  const renderBreadCrumbs = () => {
    const container = (contain: JSX.Element) => (
      <Box
        marginTop={2}
        minHeight={20}
        maxHeight={20}
      >{contain}</Box>)
    const breads = <TodoBreadCrumbs
      todo={runningTodo}
      todos={todos}
      linkOnClick={(todo: Todo) => {
        if (runningTodo && runningTodo.id === todo.id) {
          setFocusedTodo(todo)
          expandTreeView(todo.id, true, true);
        } else {
          setRunningTodo_withProc(todo)
        }
      }}></TodoBreadCrumbs>
    return (
      container(
        runningTodo ? breads :
          <Stack direction="row" spacing={1} justifyContent={"center"}>
            {breads}
            {<Box sx={{ textAlign: "center" }}>click <CasinoIcon color="secondary"></CasinoIcon> to start</Box>}
            {breads}
          </Stack>
      )
    )
  }
  return (
    <Card key="dt-timer" variant="elevation" elevation={0} sx={{ margin: "0px !important", paddingX: Card_PaddingX, paddingTop: Card_PaddingY, paddingBottom: Card_PaddingY, height: "auto" }}>
      <Stack direction={'row'} justifyContent={'center'} >
        <Stack
          direction={'column'}
          sx={{ textAlign: "center" }}
          width={timerPaneWidth}
        >
          {renderBreadCrumbs()}
          {renderTitle()}
          {renderInfo_r()}
          {renderTimer()}
          {notUntilUI}
          {renderRollDiceButton()}
          {renderTodaysTotal()}
          {tagsSelect}
          {
            userSettings.editRuntimeOnTimerPane ?
              <Stack>
                {<Typography textAlign={"center"}> {tll.t("RunTime")} </Typography>}
                {
                  <Slider
                    disabled={!runningTodo}
                    max={60}
                    min={- 1
                    }
                    step={1}
                    marks={timerRuntimeSliderMarks}
                    value={runningTodo ? sliderRunTime : -1}
                    valueLabelDisplay='auto'
                    valueLabelFormat={(num) => num < 0 ? "default" : num.toString()
                    }
                    onChange={(event, value) => {
                      if (!runningTodo) {
                        return
                      }
                      if (typeof (value) === "number") {
                        setSliderRunTime(value)
                        const runTime_sec = value < 0 ? runningTodo.runTime : value * 60
                        setTimerState({ ...timerState, remainTime: runTime_sec })
                      }
                    }}> </Slider>
                }
              </Stack>
              : null
          }
          <Box height={20}> </Box>
          {
            userSettings.editIntervalOnTimerPane ?
              <Stack>
                <Stack direction={"row"} justifyContent={"center"} >
                  <Tooltip title={
                    <Stack>
                      {< Link color={"inherit"} underline='none' component={"button"} onClick={() => {
                        if (runningTodo) {
                          const rInterval = sliderInterval < 0 ?
                            runningTodo.defaultInterval :
                            sliderInterval * sliderIntervalCoeff
                          setTodoParameter(runningTodo?.id, { interval: (Date.now() - runningTodo.lastRunDateTime) / 1000 + rInterval })
                        }
                      }
                      }> {tll.t("UpdateIntervalBySliderInterval")} </Link>}
                    </Stack>}>
                    {
                      <Typography textAlign={"center"}> {tll.t("Interval")} </Typography>}
                  </Tooltip>
                  {
                    <Link color={"inherit"} underline='none' component={"button"} onClick={() => {
                      setSliderInterval(-1)
                      setSliderIntervalUnit(sliderIntervalUnit === "Min" ? "Day" : "Min")
                    }
                    }> {" " + tll.t("(") + tll.t(sliderIntervalUnit) + tll.t(")")} </Link>}
                </Stack>
                {
                  <Slider
                    max={sliderIntervalMax}
                    min={- 1
                    }
                    disabled={!runningTodo
                    }
                    step={1}
                    marks={timerIntervalSliderMarks}
                    value={runningTodo ? sliderInterval : -1}
                    valueLabelFormat={(num) => num < 0 ? "default" : num.toString()
                    }
                    valueLabelDisplay='auto'
                    onChange={(event, value) => {
                      if (!runningTodo) return
                      if (typeof (value) === "number") {
                        setSliderInterval(value)
                      }
                    }}> </Slider>
                }
              </Stack>
              : null
          }
          <Stack marginTop={3} direction={"row"} >
            {settingsButton}
            {
              runningTodo &&
              <Button style={{ color: "grey", paddingBottom: 3 }} onClick={() => {//paddingBottom: 3 is for settingicon 
                const todoFutures_new = [...todoFutures]
                const elapsedTime = (timerState.timeAtStarted ? Date.now() - timerState.timeAtStarted : 0) + timerState.elapsedTimeUntilLastPaused
                todoFutures_new.unshift({ idOfTodo: runningTodo.id, probs: [], elapsedTime })
                setTodoFutures(todoFutures_new)
                setTimerState({ elapsedTimeUntilLastPaused: 0, timeAtStarted: null, remainTime: 0 })
                setRunningTodo_withProc(undefined, true, false);
              }
              }> <Download /></Button >}
          </Stack>
          < Stack style={{ "marginTop": "16px" }}>
            {userSettings.todosFutureNum > 1 ? <Typography variant="subtitle1"> Next TodoList</ Typography > : null}
            {
              todoFutures.flatMap((tf, idx) => {
                const t = todos.get(tf.idOfTodo)
                return t ? [
                  <Stack key={"todo-future-stack-" + idx} direction={"row"} justifyContent={"stretch"} >
                    <Button onClick={(event) => {
                      setFocusedTodo(t)
                      expandTreeView(t.id, true, true);
                    }}> {t.displayTitle} </Button>
                    < Stack justifyContent={"center"} > {timeToString(tf.elapsedTime)} </Stack>
                    < Button onClick={(event) => {
                      const todoFutures_new = todoFutures.filter((_, i) => i !== idx)
                      setTodoFutures(todoFutures_new)
                      setRunningTodo_withProc(t, true, false);
                      setTimerState({ elapsedTimeUntilLastPaused: tf.elapsedTime, timeAtStarted: Date.now(), remainTime: t.runTime })
                    }
                    }> <Start></Start></Button >
                  </Stack>
                ] : []
              })
            }
          </Stack>
        </Stack >
      </Stack>
    </Card>
  )
}