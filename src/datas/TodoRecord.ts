import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from '../util';
import { getAncestors, getTitles, Todo } from './Todo'

export type TodoRecord = {
    id: string
    idOfTodo: string
    idOfAncestors: string[] | null //230729から導入したのでそれ以前は存在しない
    createdAt: number
    titles: string[]
    tags: string[]
    runTime: number
}
export const createRecord = (data?: any) => {
    const record: TodoRecord = {
        id: uuidv4(),
        idOfTodo: "",
        idOfAncestors: null,
        createdAt: Date.now(),
        titles: [],
        tags: [],
        runTime: 0,
    }
    if (data) {
        Object.assign(record, data);
    }
    return record;
}

export const getRecord = (id: string, recordsMap: Map<String, TodoRecord>) => {
    return recordsMap.get(id);
}
export const getRecordsToday = (records: TodoRecord[]) => {
    const now = new Date();
    now.setTime(Date.now());
    const todayRecords = records.filter(d => {
        const date = new Date(d.createdAt);
        return isSameDay(date, now);
    })
    return todayRecords;
}
export const addRecord_mut = (todo: Todo, runTime: number, todosMap: Map<String, Todo>, records: TodoRecord[]): TodoRecord => {
    const record = newRecord(todo, runTime, todosMap,)
    records.push(record)
    return record;
}
export const newRecord = (todo: Todo, runTime: number, todosMap: Map<String, Todo>) => {
    const record = createRecord({
        id: uuidv4(),
        idOfTodo: todo.id,
        idOfAncestors: getAncestors(todo, todosMap).map(t => t.id),
        tags: todo.tags,
        createdAt: Date.now(),
        titles: getTitles(todo, todosMap),
        runTime: runTime
    })
    return record;
}
export const removeRecord = (record: TodoRecord, recordsMap: Map<String, TodoRecord>) => {
    recordsMap.delete(record.id);
}
export const clear = (recordsMap: Map<String, TodoRecord>) => {
    recordsMap = new Map<string, TodoRecord>();
}
export const copyRecordsMap = (recordsMap: Map<String, TodoRecord>) => {
    recordsMap = new Map(recordsMap);
    return recordsMap;
}