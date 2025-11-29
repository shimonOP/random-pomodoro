import React, { createContext, useContext, useEffect, useState } from "react";
import { getOffSprings, isRoot, Todo, TodoObject, TodoRawValues } from "../datas/Todo";
import { UserSettings } from "../datas/UserSettings";
import { TodoRecord } from "../datas/TodoRecord";
import { UserInfo } from "../datas/UserInfo";
import { createTimerState, TimerState } from "../datas/TimerState";
import { TodoFuture } from "../datas/TodoPlan";
import { deleteTodoFromDB, saveData, updateTodo, updateTodos, useDTDexieStates } from "../db";
import { TodoWeightCalculator } from "../types/calcTodoWeight";
import { TLL } from "../langs/TransLangs";

export const todoWeightCalculator_view = new TodoWeightCalculator(false)
export const todoWeightCalculator_sim = new TodoWeightCalculator(true)

// Context が持つ値の型
type DiceTodoContextType = {
    todos: Map<string, Todo>;
    setTodoParameter: (id: string, prop: Partial<TodoRawValues>) => void;
    updateTodos: typeof updateTodos;
    focusedTodo?: Todo;
    setFocusedTodo: (newFTodo?: Todo) => void;
    runningTodo?: Todo;
    setRunningTodo: (newRTodo?: Todo) => void;
    userSettings?: UserSettings;
    setUserSettings: (userSettings: UserSettings) => void;
    records: TodoRecord[];
    setRecords: (records: TodoRecord[]) => void;
    userInfo?: UserInfo;
    setUserInfo: (userInfo: UserInfo) => void;
    timerState: TimerState;
    setTimerState: (timerState: TimerState) => void;
    todoFutures: TodoFuture[];
    setTodoFutures: (todoFutures: TodoFuture[]) => void;
    loadDataFromText: (text: string) => void;
    saveData: typeof saveData;
    addTodo: (property: Partial<TodoRawValues>) => Todo;
    deleteTodo: (todo: Todo) => void;
    archiveTodo: (todo: Todo) => void;
    restoreFromArchiveTodo: (todo: Todo) => void;
    stringifyAppData: () => Promise<string>;
    setPCRelation: (parent: Todo | undefined, child: Todo) => void;
};

// Context（初期値は null にしてチェック可能に）
const DiceTodoContext = createContext<DiceTodoContextType | null>(null);

// Provider（アプリを包む）
export const DiceTodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [focusedTodoID, setFocusedTodoID] = useState<undefined | string>();
    const [checkCount, setCheckCount] = useState<undefined | number>(undefined);//一回で全部のデータを修復できない !== undefinedならもう一回

    const {
        todos,
        records,
        userSettings,
        userInfo,
        timerState,
        todoPlans: todoFutures,
        runningTodoID,
        getAllRecords
    } = useDTDexieStates();

    if (userSettings)
        new Promise((resolve) => {
            todoWeightCalculator_view.updateMemo(todos, records, userSettings, new Date())
        })

    const focusedTodo: Todo | undefined = focusedTodoID ? todos.get(focusedTodoID) : undefined;
    const runningTodo: Todo | undefined = runningTodoID ? todos.get(runningTodoID) : undefined;

    function restoreFromArchiveTodo(todo: Todo): void {
        const recursive = (todo: Todo) => {
            setTodoParameter(todo.id, { isArchived: false })
            const children = getChildren(todo);
            for (const child of children) {
                recursive(child);
            }
        }
        recursive(todo)
    }

    function archiveTodo(todo: Todo): void {
        setTodoParameter(todo.id, { isArchived: true })
        const children = getChildren(todo);
        for (const child of children) {
            archiveTodo(child)
        }
    }

    function getChildren(todo: Todo): Todo[] {
        const res = todo.childrenIds.map(id => todos.get(id)).filter((todo): todo is Todo => todo !== undefined);
        return res;
    }

    function getParent(todo: Todo): Todo | undefined {
        if (!todo.parentId) return;
        return todos.get(todo.parentId)
    }

    function breakPCRelation(parent: Todo, child: Todo): void {
        setTodoParameter(parent.id, { childrenIds: parent.childrenIds.filter(id => id !== child.id) })
        setTodoParameter(child.id, { parentId: undefined })
    }

    //前の親から子を削除もするよ
    function setPCRelation(parent: Todo | undefined, child: Todo): void {
        //巡回が起きる場合は何もしない
        if (parent) {
            const offs = getOffSprings(child, todos);
            offs.push(child)
            if (offs.includes(parent)) {
                return;
            }
        }
        if (child.parentId) {
            const prevParent = getParent(child);
            if (prevParent) {
                //前の親から子を削除
                const ids = prevParent.childrenIds.filter((id) => id !== child.id);
                setTodoParameter(prevParent.id, { childrenIds: ids })
            } else {
                throw new Error("親子関係が壊れています");
            }
        }
        if (parent) {
            setTodoParameter(parent.id, { childrenIds: parent.childrenIds.concat([child.id]) })
            setTodoParameter(child.id, { parentId: parent.id })
        } else {
            setTodoParameter(child.id, { parentId: undefined })
        }
    }

    const addTodo = (property: Partial<TodoRawValues>): Todo => {
        const newTodo = new Todo(property)
        todos.set(newTodo.id, newTodo);
        if (newTodo.parentId) {
            const parent = todos.get(newTodo.parentId)
            if (!parent) throw new Error("parent is not found")
            newTodo.inheritAttributes(parent)
            setPCRelation(parent, newTodo)
        }
        if (!userInfo || userInfo.hasCreatedDefaultTodos) {
            saveData({ todos: [newTodo] })
        } else {
            saveData({ todos: [newTodo], userInfo: { ...userInfo, hasCreatedDefaultTodos: true } })
        }
        return newTodo
    }

    const deleteTodo = (todo: Todo): void => {
        if (!todo) throw new Error("該当するTodoがありません");
        if (todo.childrenIds) {
            getChildren(todo).forEach((c) => {
                deleteTodo(c);
            });
        }
        const parent = getParent(todo);
        if (parent !== undefined) {
            breakPCRelation(parent, todo);
        }
        deleteTodoFromDB(todo.id);
    }

    useEffect(() => {
        if (checkCount !== undefined) {
            if (checkCount < 1000) {
                if (!restoreData(todos)) {
                    setCheckCount(checkCount + 1);
                } else {
                    setCheckCount(undefined);
                }
            } else {
                console.error("データは修復不可能です")
                setCheckCount(undefined);
            }
        }
    }, [checkCount])

    // 初回アクセス時にサンプルTODOを作成
    useEffect(() => {
        if (userInfo && !userInfo.hasCreatedDefaultTodos && todos.size === 0) {
            const browserLang = navigator.language || 'en';
            const tll = new TLL(browserLang.startsWith('ja') ? 'ja' : 'en');
            createInitialTodos(addTodo, tll);
            setUserInfo({ ...userInfo, hasCreatedDefaultTodos: true });
        }
    }, [todos, userInfo])

    const setTodoParameter: (id: string, prop: Partial<TodoRawValues>) => void = updateTodo;

    const restoreData = (todosLocal: Map<string, Todo>): boolean => {
        let res = true
        todosLocal.forEach((todo) => {
            if (!isRoot(todo)) {
                const parent = getParent(todo);
                if (!parent) {
                    res = false
                    setTodoParameter(todo.id, { parentId: undefined })
                } else {
                    if (!parent.childrenIds.includes(todo.id)) {
                        res = false
                        setTodoParameter(parent.id, { childrenIds: [todo.id, ...parent.childrenIds] })
                    }
                }
            }
        })
        todosLocal.forEach((todo) => {
            if (todo.parentId === null) {
                res = false
                setTodoParameter(todo.id, { parentId: undefined });
            }
        })
        return res;
    }

    const setRunningTodo_wrap = (newRTodo?: Todo): void => {
        saveData({ runningTodoID: newRTodo === undefined ? null : newRTodo.id })
    }

    const setFocusedTodo_wrap = (newFTodo?: Todo): void => {
        setFocusedTodoID(newFTodo?.id);
    }

    const setUserSettings = (userSettings_n: UserSettings): void => {
        saveData({ userSettings: userSettings_n });
    }

    const setUserInfo = (userInfo_n: UserInfo): void => {
        saveData({ userInfo: userInfo_n });
    }

    const setTodoFutures = (todoFutures_new: TodoFuture[]): void => {
        saveData({ todoFutures: todoFutures_new })
    }

    const setTimerState = (timerState_n: TimerState): void => {
        saveData({ timerState: timerState_n })
    }

    const setRecords = (records_n: TodoRecord[]): void => {
        saveData({ records: records_n })
    }

    const stringifyAppData = async (): Promise<string> => {
        type TodosObj = {
            [key: string]: TodoObject
        }
        const todosObj: TodosObj = {}
        todos.forEach((t) => {
            todosObj[t.id] = t.toObj();
        })
        const recordsObj = (await getAllRecords()).map(d => { return { ...d } })
        const app_data = { todos: todosObj, userSettings: userSettings, userInfo: userInfo, records: recordsObj, timerState }
        const body = JSON.stringify(app_data);
        return body
    }

    const loadDataFromText = (text: string): void => {
        const obj = JSON.parse(text);
        try {
            const map: Map<string, TodoObject> = new Map(Object.entries(obj.todos));
            const todos_local: Todo[] = [];
            map.forEach((t) => {
                const todo = new Todo();
                todo.fromObj(t);
                todos_local.push(todo);
            })
            setCheckCount(0);
            saveData({
                ...obj,
                todos: todos_local,
                runningTodoID: null,
                timerState: createTimerState(),
                todoFutures: [],
            }, true)
        } catch (error) {
            console.error(error);
        }
    }

    const value = {
        todos,
        setTodoParameter,
        updateTodos,
        focusedTodo,
        setFocusedTodo: setFocusedTodo_wrap,
        runningTodo,
        setRunningTodo: setRunningTodo_wrap,
        userSettings,
        setUserSettings,
        records,
        setRecords,
        userInfo,
        setUserInfo,
        timerState,
        setTimerState,
        todoFutures,
        setTodoFutures,
        loadDataFromText,
        saveData,
        addTodo,
        deleteTodo,
        archiveTodo,
        restoreFromArchiveTodo,
        stringifyAppData,
        setPCRelation,
    }

  return (
    <DiceTodoContext.Provider value={value}>
      {children}
    </DiceTodoContext.Provider>
  );
};

// Context専用フック（Provider外で使うとエラーにする）
export function useDiceTodoStates() {
  const context = useContext(DiceTodoContext);
  if (!context) {
    throw new Error("useDiceTodoStates must be used within <DiceTodoProvider>");
  }
  return context;
}

function createInitialTodos(addTodo: (property: Partial<TodoRawValues>) => void, tll: TLL) {

    // 親TODO: 作業/Work
    const workTodo = new Todo();
    workTodo.update({
        title: tll.t('InitialTodoWork'),
        runTime: 600, // 10分
        weight: 10,
    });

    // 子TODO: 勉強/Study
    const studyTodo = new Todo();
    studyTodo.update({
        title: tll.t('InitialTodoStudy'),
        runTime: 600, // 10分
        weight: 10,
    });


    // 親TODO: 休憩/Break
    const breakTodo = new Todo();
    breakTodo.update({
        title: tll.t('InitialTodoBreak'),
        runTime: 240, // 4分
        weight: 10,
        interval: 1200,
        defaultInterval: 480,
    });

    // 親TODO: 娯楽/Entertainment
    const entertainmentTodo = new Todo();
    entertainmentTodo.update({
        title: tll.t('InitialTodoEntertainment'),
        runTime: 600, // 10分
        weight: 10,
    });

    addTodo(workTodo);
    addTodo(studyTodo);
    addTodo(breakTodo);
    addTodo(entertainmentTodo);
}