import { useEffect, useState } from "react";
import { TodoRecord, } from "../datas/TodoRecord";
import { Todo, TodoObject, isRoot, getOffSprings, getTodosArray, TodoRawValues } from '../datas/Todo';
import { UserInfo } from "../datas/UserInfo";
import { UserSettings } from '../datas/UserSettings';
import { saveData, updateTodo, useDTDexieStates, updateTodos, } from '../db';
import { TimerState, createTimerState } from "../datas/TimerState";
import { TodoFuture } from "../datas/TodoPlan";
import { TodoWeightCalculator } from "../types/calcTodoWeight";

export const todoWeightCalculator_view = new TodoWeightCalculator(false)
export const todoWeightCalculator_sim = new TodoWeightCalculator(true)
export const useDiceTodoStates = () => {

    const [focusedTodoID, setFocusedTodoID] = useState<undefined | string>();
    const [isSynchronizing, setIsSynchronizing] = useState(false);
    const [checkCount, setCheckCount] = useState<undefined | number>(undefined);//一回で全部のデータを修復できない !== undefinedならもう一回
    const { todos, records, userSettings, userInfo, timerState, todoPlans: todoFutures, runningTodoID, getAllRecords } = useDTDexieStates()
    if (userSettings)
        new Promise((resolve) => {
            todoWeightCalculator_view.updateMemo(todos, records, userSettings, new Date())
        })
    const focusedTodo = focusedTodoID ? todos.get(focusedTodoID) : undefined
    const runningTodo = runningTodoID ? todos.get(runningTodoID) : undefined
    function restoreFromArchiveTodo(todo: Todo) {
        const recursive = (todo: Todo) => {
            setTodoParameter(todo.id, { isArchived: false })
            const children = getChildren(todo);
            for (const child of children) {
                recursive(child);
            }
        }
        recursive(todo)
    }
    function archiveTodo(todo: Todo) {
        setTodoParameter(todo.id, { isArchived: true })
        const children = getChildren(todo);
        for (const child of children) {
            archiveTodo(child)
        }
    }
    function getChildren(todo: Todo) {
        const res = todo.childrenIds.map(id => todos.get(id)).filter((todo): todo is Todo => todo !== undefined);
        return res;
    }
    function getParent(todo: Todo) {
        if (!todo.parentId) return;
        return todos.get(todo.parentId)
    }
    function breakPCRelation(parent: Todo, child: Todo) {
        setTodoParameter(parent.id, { childrenIds: parent.childrenIds.filter(id => id !== child.id) })
        setTodoParameter(child.id, { parentId: undefined })
    }
    //前の親から子を削除もするよ
    function setPCRelation(parent: Todo | undefined, child: Todo) {
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
    const addTodo = (property: Partial<TodoRawValues>) => {
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
    const deleteTodo = (todo: Todo) => {
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
        todo.needDelete = true;
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
    const setTodoParameter = updateTodo
    const restoreData = (todos: Map<string, Todo>) => {
        let res = true
        todos.forEach((todo) => {
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
        todos.forEach((todo) => {
            if (todo.parentId === null) {
                res = false
                setTodoParameter(todo.id, { parentId: undefined });
            }
        })
        return res;
    }
    const setRunningTodo_wrap = (newRTodo: Todo | undefined) => {
        saveData({ runningTodoID: newRTodo === undefined ? null : newRTodo.id })
    }
    const setFocusedTodo_wrap = (newFTodo: Todo | undefined) => {
        setFocusedTodoID(newFTodo?.id);
    }
    const setUserSettings = () => {
        saveData({ userSettings });
    }
    const setUserInfo = (userInfo_n: UserInfo) => {
        saveData({ userInfo });
    }
    const setTodoFutures = (todoFutures_new: TodoFuture[]) => {
        saveData({ todoFutures: todoFutures_new })
    }
    const setTimerState = (timerState: TimerState) => {
        saveData({ timerState })
    }
    const setRecords = (records: TodoRecord[]) => {
        saveData({ records })
    }

    const stringifyAppData = async () => {
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
    const loadDataFromText = (text: string) => {
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
    return {
        todos, setTodoParameter, updateTodos,
        focusedTodo, setFocusedTodo: setFocusedTodo_wrap,
        runningTodo, setRunningTodo: setRunningTodo_wrap,
        userSettings, setUserSettings,
        records, setRecords,
        userInfo, setUserInfo,
        timerState, setTimerState,
        todoFutures, setTodoFutures,
        isSynchronizing, loadDataFromText, saveData,
        addTodo, deleteTodo, archiveTodo, restoreFromArchiveTodo,
        stringifyAppData,
        setPCRelation,
    }
}