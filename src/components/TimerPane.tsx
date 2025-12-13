import { Add, Download, Remove, Start, Edit } from "@mui/icons-material"
import { Link, Tooltip, Card, Stack, Typography, Slider, Box, Button, SxProps, Theme, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import { Card_PaddingX, Card_PaddingY, GreenColorCode, IntervalInTimer_Height, TimerTitle_FontSize, TodayTotalTimeR_FontSize, TodayTotalTime_FontSize, timerRuntimeSliderMarks } from "../types/constants"
import { extractTime, isMobileDevice, probsToString, timeToString, isWebPushEnabled } from "../util"
import { todaysTotal, uniqueExecuter_notify, uniqueExecuter_autoDoTimer } from "../AppCore_"
import { Todo, isInInterval } from "../datas/Todo"
import { getRecordsToday } from "../datas/TodoRecord"
import Notifier from "../types/Notifier"
import RollDiceIcon from "./RollDiceIcon"
import TagsSelect from "./TagsSelect"
import TodoBreadCrumbs from "./TodoBreadCrumbs"
import { useContext, useEffect, useState } from "react"
import { TLLContext } from "../App"
import Timer from "./Timer"
import CasinoIcon from '@mui/icons-material/Casino';
import { useDiceTodoStates } from "../contexts/DiceTodoContext"
import { useIsMobileLayout } from "../hooks/useLayout"

let lastNotifyTime: number = 0
let hasNotifiedBrowser: boolean = false // ブラウザ通知を1回だけ表示するためのフラグ
let notifyCount: number = 0
let doingAutoTimerStatus: "stable" | "doingAutoTimer" = "stable" // doAutoTimerを一回しか発生しないようにするためのもの。

export function TimerPane(props: {
  rollDice: () => void,
  expandTreeView: (id: string, expand: boolean, recursive: boolean) => void,
  done: (elapsedTime: number) => void,
  setRunningTodo_withProc: (todo: Todo | undefined, isCompleted?: boolean, needDelete?: boolean) => void,
  sliderRunTime: number,
  setSliderRunTime: (value: number) => void,
  sliderInterval: number,
  sliderIntervalUnit: "Min" | "Day",
  sliderIntervalCoeff: number,
  sliderIntervalMax: number,
  setSliderInterval: (value: number) => void,
  setSliderIntervalUnit: (value: "Min" | "Day") => void,
  tags: string[],
  settingsButton: JSX.Element,
  statsButton: JSX.Element,
  intervalString: string,
  rProbs: number[],
  timerIntervalSliderMarks: { value: number, label: string }[],
  isDiceRolling: boolean,
  onTitleClicked: () => void,
}) {
  const {
    rollDice,
    expandTreeView,
    done,
    setRunningTodo_withProc,
    sliderRunTime,
    setSliderRunTime,
    sliderInterval,
    sliderIntervalUnit,
    sliderIntervalCoeff,
    sliderIntervalMax,
    setSliderInterval,
    setSliderIntervalUnit,
    tags,
    settingsButton,
    statsButton,
    intervalString,
    rProbs,
    timerIntervalSliderMarks,
    isDiceRolling,
    onTitleClicked,
  } = props;
  const {
    todos,
    runningTodo,
    timerState,
    setTimerState,
    setTodoParameter,
    setFocusedTodo,
    userSettings,
    setUserSettings,
    records,
    todoFutures,
    setTodoFutures,
  } = useDiceTodoStates();
  if (userSettings === undefined) return (<></>);
  const tll = useContext(TLLContext);
  const isMobileLayout = useIsMobileLayout();
  const timerPadding_X = isMobileLayout ? 3 : Card_PaddingX;
  const timerPadding_Y = isMobileLayout ? 3 : Card_PaddingY;
  const timerPaneWidth = isMobileLayout ? '100%' : 0.75 * 0.4 * window.innerWidth;

  // モバイル用の入力ダイアログの状態
  const [runtimeDialogOpen, setRuntimeDialogOpen] = useState(false);
  const [intervalDialogOpen, setIntervalDialogOpen] = useState(false);
  const [tempRuntimeValue, setTempRuntimeValue] = useState("");
  const [tempIntervalValue, setTempIntervalValue] = useState("");

  useEffect(() => {
    doingAutoTimerStatus = "stable"
    hasNotifiedBrowser = false // 新しいTODOが開始されたらフラグをリセット
    notifyCount = 0
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
          onTitleClicked();
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
            // WebPushが有効かつモバイルの場合は、ブラウザ通知と音声通知を行わない
            const isWebPushActive = isWebPushEnabled();

            if (!isWebPushActive) {
              if (now - lastNotifyTime > userSettings.notifyInterval * 1000) {
                const maxRepeats = userSettings.notifyRepeatCount;
                if (maxRepeats === -1 || notifyCount <= maxRepeats) {
                  // ブラウザ通知は最初の1回だけ
                  lastNotifyTime = now
                  if (!hasNotifiedBrowser) {
                    hasNotifiedBrowser = true
                    if (userSettings.notifyByBrowserOnEnd) {
                      uniqueExecuter_notify.run(() => {
                        Notifier.instance.notifyEndWithBrowser(runningTodo.displayTitle, userSettings.language, userSettings.notifyVolume);
                      })
                    }
                  }
                  // 2回目以降は音声通知のみ（設定された間隔）
                  if (userSettings.needSpeechNotifyOnEnd) {
                    uniqueExecuter_notify.run(() => {
                      Notifier.instance.notifyEnd(runningTodo.displayTitle, userSettings.language, userSettings.notifyVolume);
                    })
                  }
                  notifyCount++;
                }
              }
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
          if (runningTodo) {
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
            setUserSettings({ ...userSettings, timerTags: userSettings.timerTags.filter((t) => t !== tag) });
          }}
          onChange={(tag: string) => {
            if (!userSettings.timerTags.some(t => t === tag)) {
              setUserSettings({ ...userSettings, timerTags: [...userSettings.timerTags, tag] });
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
            setUserSettings({ ...userSettings, timerExTags: userSettings.timerExTags.filter((t) => t !== tag) });
          }}
          onChange={(tag: string) => {
            if (!userSettings.timerExTags.some(t => t === tag)) {
              setUserSettings({ ...userSettings, timerExTags: [...userSettings.timerExTags, tag] });
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
    <Card key="dt-timer" variant="elevation" elevation={0} sx={{
      margin: "0px !important",
      paddingX: timerPadding_X,
      paddingTop: isMobileLayout ? 10 : timerPadding_Y,
      paddingBottom: timerPadding_Y,
      height: isMobileLayout ? "100vh" : "auto",
      borderWidth: isMobileLayout ? 0 : 0.5,
      borderColor: "#BBB",
      position: isMobileLayout ? "relative" : "static",
    }}>
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
                <Typography textAlign={"center"}> {tll.t("RunTime")} </Typography>
                {isMobileLayout ? (
                  <>
                    <Button
                      disabled={!runningTodo}
                      variant="outlined"
                      onClick={() => {
                        setTempRuntimeValue(sliderRunTime < 0 ? "" : sliderRunTime.toString());
                        setRuntimeDialogOpen(true);
                      }}
                      endIcon={<Edit />}
                      sx={{ minWidth: 150 }}
                    >
                      {sliderRunTime < 0 ? "default" : `${sliderRunTime}min`}
                    </Button>
                    <Dialog open={runtimeDialogOpen} onClose={() => setRuntimeDialogOpen(false)}>
                      <DialogTitle>{tll.t("RunTime")}</DialogTitle>
                      <DialogContent>
                        <TextField
                          autoFocus
                          margin="dense"
                          label="Minutes (-1 for default)"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={tempRuntimeValue}
                          onChange={(e) => setTempRuntimeValue(e.target.value)}
                          inputProps={{ min: -1, max: 60 }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setRuntimeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                          if (!runningTodo) return;
                          const newValue = tempRuntimeValue === "" ? -1 : parseInt(tempRuntimeValue);
                          if (isNaN(newValue)) return;
                          const clampedValue = Math.max(-1, Math.min(60, newValue));
                          setSliderRunTime(clampedValue);
                          const runTime_sec = clampedValue < 0 ? runningTodo.runTime : clampedValue * 60;
                          setTimerState({ ...timerState, remainTime: runTime_sec });
                          setRuntimeDialogOpen(false);
                        }}>OK</Button>
                      </DialogActions>
                    </Dialog>
                  </>
                ) : (
                  <Slider
                    disabled={!runningTodo}
                    max={60}
                    min={-1}
                    step={1}
                    marks={timerRuntimeSliderMarks}
                    value={runningTodo ? sliderRunTime : -1}
                    valueLabelDisplay='auto'
                    valueLabelFormat={(num) => num < 0 ? "default" : num.toString()}
                    onChange={(event, value) => {
                      if (!runningTodo) return;
                      if (typeof (value) === "number") {
                        setSliderRunTime(value);
                        const runTime_sec = value < 0 ? runningTodo.runTime : value * 60;
                        setTimerState({ ...timerState, remainTime: runTime_sec });
                      }
                    }}
                  />
                )}
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
                    <Typography textAlign={"center"}> {tll.t("Interval")} </Typography>
                  </Tooltip>
                  <Link color={"inherit"} underline='none' component={"button"} onClick={() => {
                    setSliderInterval(-1)
                    setSliderIntervalUnit(sliderIntervalUnit === "Min" ? "Day" : "Min")
                  }}> {" " + tll.t("(") + tll.t(sliderIntervalUnit) + tll.t(")")} </Link>
                </Stack>
                {isMobileLayout ? (
                  <>
                    <Button
                      disabled={!runningTodo}
                      variant="outlined"
                      onClick={() => {
                        setTempIntervalValue(sliderInterval < 0 ? "" : sliderInterval.toString());
                        setIntervalDialogOpen(true);
                      }}
                      endIcon={<Edit />}
                      sx={{ minWidth: 150 }}
                    >
                      {sliderInterval < 0 ? "default" : `${sliderInterval}${sliderIntervalUnit === "Min" ? "min" : "day"}`}
                    </Button>
                    <Dialog open={intervalDialogOpen} onClose={() => setIntervalDialogOpen(false)}>
                      <DialogTitle>{tll.t("Interval")}</DialogTitle>
                      <DialogContent>
                        <TextField
                          autoFocus
                          margin="dense"
                          label={`${sliderIntervalUnit} (-1 for default)`}
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={tempIntervalValue}
                          onChange={(e) => setTempIntervalValue(e.target.value)}
                          inputProps={{ min: -1, max: sliderIntervalMax }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setIntervalDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                          if (!runningTodo) return;
                          const newValue = tempIntervalValue === "" ? -1 : parseInt(tempIntervalValue);
                          if (isNaN(newValue)) return;
                          const clampedValue = Math.max(-1, Math.min(sliderIntervalMax, newValue));
                          setSliderInterval(clampedValue);
                          setIntervalDialogOpen(false);
                        }}>OK</Button>
                      </DialogActions>
                    </Dialog>
                  </>
                ) : (
                  <Slider
                    max={sliderIntervalMax}
                    min={-1}
                    disabled={!runningTodo}
                    step={1}
                    marks={timerIntervalSliderMarks}
                    value={runningTodo ? sliderInterval : -1}
                    valueLabelFormat={(num) => num < 0 ? "default" : num.toString()}
                    valueLabelDisplay='auto'
                    onChange={(event, value) => {
                      if (!runningTodo) return
                      if (typeof (value) === "number") {
                        setSliderInterval(value)
                      }
                    }}
                  />
                )}
              </Stack>
              : null
          }
          <Stack marginTop={3} direction={"row"} >
            {settingsButton}
            {statsButton}
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