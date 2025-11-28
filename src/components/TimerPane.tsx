import { Add, Download, Remove, Start } from "@mui/icons-material"
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
let hasNotifiedBrowser: boolean = false // ブラウザ通知を1回だけ表示するためのフラグ
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
  setUserSettings: (userSettings: UserSettings) => void,
  settingsButton: JSX.Element,
  intervalString: string,
  rProbs: number[],
  timerIntervalSliderMarks: { value: number, label: string }[],
  timerPaneWidth: number,
  isDiceRolling: boolean,
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
    intervalString,
    rProbs,
    timerIntervalSliderMarks,
    timerPaneWidth,
    isDiceRolling,
  } = props;
  const tll = useContext(TLLContext);
  useEffect(() => {
    doingAutoTimerStatus = "stable"
    hasNotifiedBrowser = false // 新しいTODOが開始されたらフラグをリセット
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
      <div style={{ minHeight: 50, maxHeight: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFocusedTodo(runningTodo)
            if (runningTodo) expandTreeView(runningTodo.id, true, true);
          }}
          disabled={!Boolean(runningTodo)}
          style={sx}
        >
          <span style={{ fontSize: fsize }}>{title}</span>
        </button>
      </div>
    )

  }
  const renderInfo_r = () => {
    const container = (contain: JSX.Element) => (
      <div
        style={{ minHeight: 15, maxHeight: 15 }}
      >{contain}</div>)
    if (runningTodo) {
      return container(
        <div
          style={{
            textAlign: "left",
            color: "#00000099",
            fontSize: TodayTotalTimeR_FontSize
          }}>
          {todaysTotal(runningTodo, records) + ", " + probsToString(rProbs)}
        </div>
      )
    }
    return container(<></>)
  }
  const notUntilUI =
    <div style={{ minHeight: IntervalInTimer_Height, maxHeight: IntervalInTimer_Height }}>
      <div style={{ margin: '0.5rem', color: GreenColorCode }}>{intervalString}</div>
    </div>;
  const renderRollDiceButton = () => {
    return (
      <div className="tooltip" data-tip={tll.t("RollDice")}>
        <button
          className="btn btn-secondary w-full"
          onClick={async () => {
            rollDice();
          }}
        >
          <RollDiceIcon
            isRolling={isDiceRolling}
          ></RollDiceIcon>
        </button>
      </div>
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
              // ブラウザ通知は最初の1回だけ
              lastNotifyTime = now
              if (!hasNotifiedBrowser) {
                hasNotifiedBrowser = true
                uniqueExecuter_notify.run(() => {
                  Notifier.instance.notifyEndWithBrowser(runningTodo.displayTitle, userSettings.language, userSettings.notifyVolume);
                })
              }
              // 2回目以降は音声通知のみ（20秒間隔）
              if (userSettings.needSpeechNotifyOnEnd) {
                uniqueExecuter_notify.run(() => {
                  Notifier.instance.notifyEnd(runningTodo.displayTitle, userSettings.language, userSettings.notifyVolume);
                })
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
    return (<div style={{ fontSize: TodayTotalTime_FontSize }}>
      {displayStr}
    </div>)
  }
  const tagsSelect = (
    userSettings.doRestrictByTags ?
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
      </div> :
      <></>
  )
  const renderBreadCrumbs = () => {
    const container = (contain: JSX.Element) => (
      <div
        style={{ marginTop: '0.5rem', minHeight: 20, maxHeight: 20 }}
      >{contain}</div>)
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
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', justifyContent: 'center', alignItems: 'center' }}>
            {breads}
            <div style={{ textAlign: "center" }}>click <CasinoIcon color="secondary"></CasinoIcon> to start</div>
            {breads}
          </div>
      )
    )
  }
  return (
    <div key="dt-timer" className="card bg-base-100 border border-base-300" style={{
      margin: "0px !important",
      paddingLeft: Card_PaddingX,
      paddingRight: Card_PaddingX,
      paddingTop: Card_PaddingY,
      paddingBottom: Card_PaddingY,
      height: "auto",
    }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: "center",
            width: timerPaneWidth
          }}
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
              <div>
                <div style={{ textAlign: "center" }}> {tll.t("RunTime")} </div>
                <input
                  type="range"
                  disabled={!runningTodo}
                  max={60}
                  min={-1}
                  step={1}
                  value={runningTodo ? sliderRunTime : -1}
                  className="range range-sm"
                  onChange={(event) => {
                    if (!runningTodo) {
                      return
                    }
                    const value = Number(event.target.value)
                    setSliderRunTime(value)
                    const runTime_sec = value < 0 ? runningTodo.runTime : value * 60
                    setTimerState({ ...timerState, remainTime: runTime_sec })
                  }}
                />
              </div>
              : null
          }
          <div style={{ height: 20 }}> </div>
          {
            userSettings.editIntervalOnTimerPane ?
              <div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="tooltip" data-tip={tll.t("UpdateIntervalBySliderInterval")}>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => {
                        if (runningTodo) {
                          const rInterval = sliderInterval < 0 ?
                            runningTodo.defaultInterval :
                            sliderInterval * sliderIntervalCoeff
                          setTodoParameter(runningTodo?.id, { interval: (Date.now() - runningTodo.lastRunDateTime) / 1000 + rInterval })
                        }
                      }}
                    >
                      {tll.t("Interval")}
                    </button>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      setSliderInterval(-1)
                      setSliderIntervalUnit(sliderIntervalUnit === "Min" ? "Day" : "Min")
                    }}
                  >
                    {" " + tll.t("(") + tll.t(sliderIntervalUnit) + tll.t(")")}
                  </button>
                </div>
                <input
                  type="range"
                  max={sliderIntervalMax}
                  min={-1}
                  disabled={!runningTodo}
                  step={1}
                  value={runningTodo ? sliderInterval : -1}
                  className="range range-sm"
                  onChange={(event) => {
                    if (!runningTodo) return
                    const value = Number(event.target.value)
                    setSliderInterval(value)
                  }}
                />
              </div>
              : null
          }
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
            {settingsButton}
            {
              runningTodo &&
              <button className="btn btn-ghost" style={{ color: "grey", paddingBottom: 3 }} onClick={() => {//paddingBottom: 3 is for settingicon
                const todoFutures_new = [...todoFutures]
                const elapsedTime = (timerState.timeAtStarted ? Date.now() - timerState.timeAtStarted : 0) + timerState.elapsedTimeUntilLastPaused
                todoFutures_new.unshift({ idOfTodo: runningTodo.id, probs: [], elapsedTime })
                setTodoFutures(todoFutures_new)
                setTimerState({ elapsedTimeUntilLastPaused: 0, timeAtStarted: null, remainTime: 0 })
                setRunningTodo_withProc(undefined, true, false);
              }
              }> <Download /></button>}
          </div>
          <div style={{ marginTop: "1rem" }}>
            {userSettings.todosFutureNum > 1 ? <div className="text-lg font-semibold"> Next TodoList</div> : null}
            {
              todoFutures.flatMap((tf, idx) => {
                const t = todos.get(tf.idOfTodo)
                return t ? [
                  <div key={"todo-future-stack-" + idx} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'stretch', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-ghost flex-1" onClick={(event) => {
                      setFocusedTodo(t)
                      expandTreeView(t.id, true, true);
                    }}> {t.displayTitle} </button>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {timeToString(tf.elapsedTime)} </div>
                    <button className="btn btn-ghost" onClick={(event) => {
                      const todoFutures_new = todoFutures.filter((_, i) => i !== idx)
                      setTodoFutures(todoFutures_new)
                      setRunningTodo_withProc(t, true, false);
                      setTimerState({ elapsedTimeUntilLastPaused: tf.elapsedTime, timeAtStarted: Date.now(), remainTime: t.runTime })
                    }
                    }> <Start></Start></button>
                  </div>
                ] : []
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}