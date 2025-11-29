// db.ts
import Dexie, { Table } from 'dexie';
import { Todo, TodoObject, TodoRawValues } from './datas/Todo';
import { TodoRecord } from './datas/TodoRecord';
import { UserSettings, createUserSettings } from './datas/UserSettings';
import { UserInfo, createUserInfo } from './datas/UserInfo';
import { useLiveQuery } from 'dexie-react-hooks';
import { TimerState, createTimerState } from './datas/TimerState';
import { TodoFuture } from './datas/TodoPlan';

class DTDexie extends Dexie {
    // 一つの構造体にまとめることはできないよ。ユーザー定義型の配列を格納できないからね。
    todos!: Table<TodoObject>;
    records!: Table<TodoRecord>;
    userSettings!: Table<UserSettings>
    userInfo!: Table<UserInfo>
    timerState!: Table<TimerState>
    todoFutures!: Table<TodoFuture[]>
    runningTodoID!: Table<string | null>
    constructor() {
        super('todos-db');
        this.version(1).stores({
            todos: 'id',// Primary key and indexed props
            records: 'id',
            userSettings: '',
            userInfo: ''
        });
        this.version(2).stores({
            todos: 'id',// Primary key and indexed props
            records: 'id,createdAt',
            userSettings: '',
            userInfo: ''
        });
        this.version(6).stores({
            todos: 'id',// Primary key and indexed props
            records: 'id,createdAt',
            userSettings: '',
            userInfo: '',
            timerState: '',
            todoFutures: '',
            runningTodoID: '',
        });
    }
}
const db = new DTDexie();

export type SaveData = {
    todos: Todo[]
    records: TodoRecord[]
    userSettings: UserSettings
    userInfo: UserInfo
    timerState: TimerState
    todoFutures: TodoFuture[]
    runningTodoID: string | null
}
export async function saveData(
    {
        todos,
        records,
        userSettings,
        userInfo,
        timerState,
        todoFutures,
        runningTodoID,
    }: Partial<SaveData>, clearTodosRecords = false) {
    if (clearTodosRecords) {
        await db.todos.clear()
        await db.records.clear()
    }
    if (todos !== undefined) {
        const todoDatas = todos.map(t => t.toObj());
        await db.todos.bulkPut(
            todoDatas
        );
        const deletedIds = todos.filter(t => t.needDelete).map(t => t.id)
        await db.todos.bulkDelete(
            deletedIds
        )
    }
    if (records !== undefined) {
        await db.records.bulkPut(
            records
        );
    }
    if (userSettings !== undefined) {
        await db.userSettings.put(
            userSettings, "singleton"
        );
    }
    if (userInfo !== undefined) {
        await db.userInfo.put(
            userInfo, "singleton"
        );
    }
    if (timerState !== undefined) {
        await db.timerState.put(
            timerState, "singleton"
        );
    }
    if (todoFutures !== undefined) {
        await db.todoFutures.put(
            todoFutures, "singleton"
        );
    }
    if (runningTodoID !== undefined) {
        await db.runningTodoID.put(
            runningTodoID, "singleton"
        );
    }
}
export async function deleteTodoFromDB(id: string) {
    await db.todos.delete(id)
}
export const updateTodos = async (updates: { id: string, property: Partial<TodoRawValues> }[]) => {
    const newTodos: Todo[] = []
    for (const { id, property } of updates) {
        const todoObj = await db.todos.get(id)
        if (!todoObj) return;
        const todo = new Todo().fromObj(todoObj)
        todo.update(property)
        newTodos.push(todo)
    }
    await db.todos.bulkPut(newTodos.map(t => t.toObj()))
}
export const updateTodo = async (id: string, property: Partial<TodoRawValues>) => {
    const todoObj = await db.todos.get(id)
    if (!todoObj) return;
    const todo = new Todo().fromObj(todoObj)
    todo.update(property)
    await db.todos.put(todo.toObj())
}

export const useDTDexieStates = () => {
    const todos = useLiveQuery(async () => {
        const newTodosArray: Todo[] = (await db.todos.toArray()).map((tOb: TodoObject) => new Todo().fromObj(tOb));
        const nMap = new Map<string, Todo>();
        newTodosArray.forEach(t => {
            nMap.set(t.id, t)
        })

        return nMap
    }) || new Map<string, Todo>()
    const records = useLiveQuery(() => {
        return loadRecordsLatestN(null)
    }) || []
    const userSettings = useLiveQuery(async () => {
        const userSettings_old = await db.userSettings.get("userSettings")
        if (userSettings_old !== undefined) {
            await db.userSettings.put(userSettings_old, "singleton")
            await db.userSettings.delete("userSettings")
            return createUserSettings(userSettings_old)
        }
        return createUserSettings(await db.userSettings.get("singleton"))
    })
    const userInfo = useLiveQuery(async () => {
        return createUserInfo(await db.userInfo.get("singleton"));
    })
    const timerState = useLiveQuery(async () => {
        return createTimerState(await db.timerState.get("singleton"));
    }) || createTimerState()
    const todoPlans = useLiveQuery(async () => {
        return await db.todoFutures.get("singleton")
    }) || []
    const runningTodoID = useLiveQuery(async () => {
        return await db.runningTodoID.get("singleton")
    }) || null
    const getAllRecords = async () => {
        return await db.records.toCollection().sortBy("createdAt")
    }
    return { todos, records, userSettings, userInfo, timerState, todoPlans, runningTodoID, getAllRecords }
}

export async function existUserSettings() {
    const uF = await db.userSettings.get("userSettings")
    return uF !== undefined
}
export async function loadRecordsLatestN(day: number | null) {
    if (day === null) {
        const recordArray = await db.records.toArray();
        return recordArray
    }
    if (day <= 0) return []
    const day_ms = day * 86400 * 1000
    const since_ms = Date.now() - day_ms
    const recordArray = await db.records.where("createdAt").above(since_ms).sortBy("createdAt"); // 300ms +- 100ms 10倍で2倍
    return recordArray
}

export async function clearAllData() {
    await db.todos.clear()
    await db.records.clear()
    await db.userSettings.clear()
    await db.userInfo.clear()
    await db.timerState.clear()
    await db.todoFutures.clear()
    await db.runningTodoID.clear()
}