import { styled } from "@mui/material"
import { Card_PaddingX, Card_PaddingY, Drawer_Width, Mobile_BreakPoint, Tablet_BreakPoint } from "./types/constants"
import { UniqueInTabsExecuter } from "./types/uniqueInTabsExecuter"
import { Todo, TodoRawValues, getAncestors, getTitlesReadByVoice, isInInterval } from "./datas/Todo";
import { getRecordsToday, newRecord } from "./datas/TodoRecord";
import { extractTime } from "./util";
import { TodoRecord } from "./datas/TodoRecord";
import { selectTodoAtRandom } from "./selectTodo";
import Notifier from "./types/Notifier";
import { UserSettings } from "./datas/UserSettings";
import { TimerState } from "./datas/TimerState";
import { todoWeightCalculator_sim } from "./contexts/DiceTodoContext";
// 流石に1000行超えると、エディタの動作速度が落ちるので、

//constants_dicetodoapp
export const Todo_Archive_NodeID = "Todo_Archive_Node_ID"
export const addTodoToInboxButton_ID = "AddTodoToInboxButton_ID_315493"
//constants_dicetodoapp//


export const uniqueExecuter_autoDoTimer = new UniqueInTabsExecuter("RandomPomodoro_UniqueInTab_AutoDoTimer")
export const uniqueExecuter_notify = new UniqueInTabsExecuter("RandomPomodoro_UniqueInTab_Notify")

export const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${Drawer_Width}px`,
  [theme.breakpoints.down(Mobile_BreakPoint)]: {
    padding: 0,
  },
  [theme.breakpoints.up(Mobile_BreakPoint + 1)]: {
    marginTop: '48px', // Toolbar height for dense variant (only on non-mobile)
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));
export const calcAppContentLayout = (windowSize: { width: number, height: number }, isDrawerOpen: boolean) => {
  const isPCLayout = windowSize.width > Tablet_BreakPoint
  const isMobileLayout = windowSize.width <= Mobile_BreakPoint
  const drawerWidth = isDrawerOpen ? Drawer_Width : 0;
  const appWidth = windowSize.width - drawerWidth;
  const todoPaneWidth = isPCLayout ? 0.4 * appWidth : 0.7 * appWidth
  const timerPaneWidth = isPCLayout ? 3 / 4 * todoPaneWidth : todoPaneWidth;
  const todoPanePadding_X = isMobileLayout ? 0 : Card_PaddingX;
  const todoPanePadding_Y = isMobileLayout ? 0 : Card_PaddingY;
  return {
    todoPaneWidth: todoPaneWidth,
    timerPaneWidth: timerPaneWidth,
    todoPanePadding_X: todoPanePadding_X,
    todoPanePadding_Y: todoPanePadding_Y,
  }
}
export const todaysTotal = (todo: Todo, records: TodoRecord[]) => {
  const sumMin = getRecordsToday(records)
    .filter(r => r.idOfAncestors?.includes(todo.id))
    .map(d => d.runTime).reduce((a, b) => a + b, 0) / 60;
  const hour = extractTime(sumMin, "minutes", "hours");
  const min = extractTime(sumMin, "minutes", "minutes");
  const displayStr = hour + "h" + min + "m"
  return displayStr
}
export const rollDice_ = (
  isDiceRolling: boolean,
  todos: Map<string, Todo>,
  records: TodoRecord[],
  userSettings: UserSettings,
  timerState: TimerState,
  setIsDiceRolling: (b: boolean) => void,
  setRprobs: (probs: number[]) => void,
  setTimerState: (timerState: TimerState) => void,
  setRunningTodo_withProc: (todo: Todo | undefined, isCompleted: boolean, needDelete: boolean) => void,
  setAddTodoHelpOpen: (b: boolean) => void,
  parentT?: Todo,
) => {
  if (isDiceRolling) return;


  const res = selectTodoAtRandom(parentT, todos, (todo: Todo) => {
    return todoWeightCalculator_sim.calcWeight(todo, todos, records, userSettings, new Date())
  })
  if (res.todo) {
    setIsDiceRolling(true);
    setTimeout(() => {
      setIsDiceRolling(false);
      const { todo, probs } = res;
      setRprobs(probs);
      setRunningTodo_withProc(todo, true, false);
      setTimerState({
        ...timerState,
        timeAtStarted: timerState.timeAtStarted === null ?
          Date.now() :
          timerState.timeAtStarted,
        elapsedTimeUntilLastPaused: timerState.elapsedTimeUntilLastPaused,
        remainTime: todo ? todo.runTime : 0,
      })
      if (userSettings.needSpeechNotifyOnStart) {
        if (todo) {
          const speechText = getTitlesReadByVoice(todo, todos).join(",");
          Notifier.instance.notifyStart(speechText, userSettings.language, userSettings.notifyVolume, true);
        }
      }
    }, userSettings.diceRollDuration)
  } else {
    setAddTodoHelpOpen(true);
    setTimeout(() => { setAddTodoHelpOpen(false) }, 2000)
  }
}
export function done_(
  elapsedTime: number,
  runningTodo: Todo | undefined,
  sliderInterval: number,
  sliderIntervalCoeff: number,
  todos: Map<string, Todo>,
  setRunningTodo_withProc: (todo: Todo | undefined, isCompleted: boolean, needDelete: boolean) => void,
  setTimerState: (timerState: TimerState) => void,
  updateTodos: (updates: { id: string, property: Partial<TodoRawValues> }[]) => Promise<void>,
  setRecords: (records: TodoRecord[]) => void,
) {
  const runTime_sec = Math.floor(elapsedTime / 1000)

  setRunningTodo_withProc(undefined, true, false);
  setTimerState({ elapsedTimeUntilLastPaused: 0, timeAtStarted: null, remainTime: 0 })
  if (runningTodo) {
    const rInterval = sliderInterval < 0 ?
      runningTodo.defaultInterval :
      sliderInterval * sliderIntervalCoeff
    const recordTimeOfAncesters = (runTime: number, todo: Todo, todos: Map<string, Todo>, now: number) => {
      const ancestors = getAncestors(todo, todos);
      const updates: { id: string, property: Partial<TodoRawValues> }[] = []
      for (const a of ancestors) {
        const interval = (() => {
          if (a.id === todo.id) {
            return rInterval
          } else if (isInInterval(a, new Date(now)) && a.interval !== 0) {
            return Math.max(Math.floor(a.interval - (now - a.lastRunDateTime) / 1000), 0)
          }
          else {
            return a.defaultInterval
          }
        })()
        updates.push({ id: a.id, property: { sumRunTime: a.sumRunTime + runTime, lastRunDateTime: now, interval: interval } })
      }
      updateTodos(updates)
    }
    recordTimeOfAncesters(runTime_sec, runningTodo, todos, Date.now());
    setRecords([newRecord(runningTodo, runTime_sec, todos)]);
  }
}